import * as THREE from "three";
import { FingerBoard, FingerBoardSide } from "./FingerBoard";

interface BoxProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  jointType: "flat" | "finger";
  fingerSize?: number;
}

interface ComponentSpec {
  name: string;
  side: FingerBoardSide;
  fingerWidth: number;
  fingerHeight: number;
  actualWidth?: number;
  flatGeometry: () => THREE.BoxGeometry;
  flatPosition: THREE.Vector3;
}

export class Box {
  private fingerBoard?: FingerBoard;

  constructor(private props: BoxProps) {
    if (props.jointType === "finger" && props.fingerSize) {
      this.fingerBoard = new FingerBoard({
        width: props.width,
        height: props.height,
        depth: props.depth,
        thickness: props.thickness,
        fingerSize: props.fingerSize,
      });
    }
  }

  createMesh(): THREE.Group {
    const { width, height, depth, thickness, jointType, fingerSize } =
      this.props;
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: 0x9b87f5,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.8,
    });

    // Define all components with their specifications
    const components: ComponentSpec[] = [
      // Front panel
      {
        name: "Front Panel",
        side: "front",
        fingerWidth: width - 2 * thickness,
        fingerHeight: height,
        actualWidth: width,
        flatGeometry: () =>
          new THREE.BoxGeometry(
            (width - 2 * thickness) / 100,
            (height - thickness) / 100,
            thickness / 100
          ),
        flatPosition: new THREE.Vector3(
          0,
          thickness / 200,
          (depth - thickness) / 200
        ),
      },
      // Back panel
      {
        name: "Back Panel",
        side: "back",
        fingerWidth: width - 2 * thickness,
        fingerHeight: height,
        actualWidth: width,
        flatGeometry: () =>
          new THREE.BoxGeometry(
            (width - 2 * thickness) / 100,
            (height - thickness) / 100,
            thickness / 100
          ),
        flatPosition: new THREE.Vector3(
          0,
          thickness / 200,
          -(depth - thickness) / 200
        ),
      },
      // Left panel
      {
        name: "Left Panel",
        side: "left",
        fingerWidth: depth - 2 * thickness,
        fingerHeight: height,
        flatGeometry: () =>
          new THREE.BoxGeometry(
            thickness / 100,
            (height - thickness) / 100,
            depth / 100
          ),
        flatPosition: new THREE.Vector3(
          -(width - thickness) / 200,
          thickness / 200,
          0
        ),
      },
      // Right panel
      {
        name: "Right Panel",
        side: "right",
        fingerWidth: depth - 2 * thickness,
        fingerHeight: height,
        flatGeometry: () =>
          new THREE.BoxGeometry(
            thickness / 100,
            (height - thickness) / 100,
            depth / 100
          ),
        flatPosition: new THREE.Vector3(
          (width - thickness) / 200,
          thickness / 200,
          0
        ),
      },
      // Bottom panel
      {
        name: "Bottom Panel",
        side: "bottom",
        fingerWidth: width - 2 * thickness,
        fingerHeight: depth - 2 * thickness,
        flatGeometry: () =>
          new THREE.BoxGeometry(width / 100, thickness / 100, depth / 100),
        flatPosition: new THREE.Vector3(0, -(height - thickness) / 200, 0),
      },
    ];

    // Create components based on joint type
    components.forEach((component) => {
      let mesh: THREE.Mesh;

      if (
        jointType === "finger" &&
        fingerSize &&
        fingerSize > 0 &&
        this.fingerBoard
      ) {
        // Create finger joint component
        mesh = this.fingerBoard.createFingerBoard(
          component.fingerWidth,
          component.fingerHeight,
          thickness,
          component.side,
          fingerSize,
          material,
          component.actualWidth
        );
      } else {
        // Create flat joint component
        const geometry = component.flatGeometry();
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(component.flatPosition);
      }

      // Set component name
      mesh.userData.componentName = component.name;

      // Add edges and add to group
      this.addEdges(mesh);
      group.add(mesh);
    });

    return group;
  }

  private addEdges(board: THREE.Mesh) {
    const edges = new THREE.EdgesGeometry(board.geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    board.add(wireframe);
  }
}
