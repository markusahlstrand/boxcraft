import * as THREE from "three";

interface BoxProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  jointType: "flat" | "finger";
  fingerSize?: number;
}

export class Box {
  constructor(private props: BoxProps) {}

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

    if (jointType === "finger" && fingerSize && fingerSize > 0) {
      // Use finger joint geometry for all sides
      group.add(
        this.createFingerBoard(
          width,
          height,
          thickness,
          "front",
          fingerSize,
          material
        )
      );
      group.add(
        this.createFingerBoard(
          width,
          height,
          thickness,
          "back",
          fingerSize,
          material
        )
      );
      group.add(
        this.createFingerBoard(
          depth,
          height,
          thickness,
          "left",
          fingerSize,
          material
        )
      );
      group.add(
        this.createFingerBoard(
          depth,
          height,
          thickness,
          "right",
          fingerSize,
          material
        )
      );
      group.add(
        this.createFingerBoard(
          width,
          depth,
          thickness,
          "bottom",
          fingerSize,
          material
        )
      );
    } else {
      // Back board
      const backGeometry = new THREE.BoxGeometry(
        (width - 2 * thickness) / 100,
        (height - thickness) / 100,
        thickness / 100
      );
      const backBoard = new THREE.Mesh(backGeometry, material);
      backBoard.position.z = -(depth - thickness) / 200;
      backBoard.position.y = thickness / 200;
      this.addEdges(backBoard);
      group.add(backBoard);

      // Front board
      const frontBoard = backBoard.clone();
      frontBoard.position.z = (depth - thickness) / 200;
      this.addEdges(frontBoard);
      group.add(frontBoard);

      // Left board
      const leftGeometry = new THREE.BoxGeometry(
        thickness / 100,
        (height - thickness) / 100,
        depth / 100
      );
      const leftBoard = new THREE.Mesh(leftGeometry, material);
      leftBoard.position.x = -(width - thickness) / 200;
      leftBoard.position.y = thickness / 200;
      this.addEdges(leftBoard);
      group.add(leftBoard);

      // Right board
      const rightBoard = leftBoard.clone();
      rightBoard.position.x = (width - thickness) / 200;
      this.addEdges(rightBoard);
      group.add(rightBoard);

      // Bottom board only
      const bottomGeometry = new THREE.BoxGeometry(
        width / 100,
        thickness / 100,
        depth / 100
      );
      const bottomBoard = new THREE.Mesh(bottomGeometry, material);
      bottomBoard.position.y = -(height - thickness) / 200;
      this.addEdges(bottomBoard);
      group.add(bottomBoard);
    }

    return group;
  }

  /**
   * Create a board with finger joints on the edges.
   * side: 'front' | 'back' | 'left' | 'right' | 'bottom'
   */
  private createFingerBoard(
    w: number,
    h: number,
    t: number,
    side: string,
    fingerSize: number,
    material: THREE.Material
  ) {
    const shape = new THREE.Shape();
    const x0 = -w / 2 / 100;
    const y0 = -h / 2 / 100;
    const x1 = w / 2 / 100;
    const y1 = h / 2 / 100;
    const tScaled = t / 100;

    let countX = Math.floor(w / fingerSize);
    if (countX % 2 === 0) countX++;
    let countY = Math.floor(h / fingerSize);
    if (countY % 2 === 0) countY++;

    const fx = w / countX / 100;
    const fy = h / countY / 100;

    shape.moveTo(x0, y0);

    // Bottom edge (from left to right)
    for (let i = 0; i < countX; i++) {
      const cx = x0 + i * fx;
      if (i % 2 === 0) {
        // finger
        shape.lineTo(cx, y0 - tScaled);
        shape.lineTo(cx + fx, y0 - tScaled);
        shape.lineTo(cx + fx, y0);
      } else {
        // gap
        shape.lineTo(cx + fx, y0);
      }
    }

    // Right edge (from bottom to top)
    for (let i = 0; i < countY; i++) {
      const cy = y0 + i * fy;
      if (i % 2 === 0) {
        // finger
        shape.lineTo(x1 + tScaled, cy);
        shape.lineTo(x1 + tScaled, cy + fy);
        shape.lineTo(x1, cy + fy);
      } else {
        // gap
        shape.lineTo(x1, cy + fy);
      }
    }

    // Top edge (from right to left)
    for (let i = 0; i < countX; i++) {
      const cx = x1 - i * fx;
      if (i % 2 === 0) {
        // finger
        shape.lineTo(cx, y1 + tScaled);
        shape.lineTo(cx - fx, y1 + tScaled);
        shape.lineTo(cx - fx, y1);
      } else {
        // gap
        shape.lineTo(cx - fx, y1);
      }
    }

    // Left edge (from top to bottom)
    for (let i = 0; i < countY; i++) {
      const cy = y1 - i * fy;
      if (i % 2 === 0) {
        // finger
        shape.lineTo(x0 - tScaled, cy);
        shape.lineTo(x0 - tScaled, cy - fy);
        shape.lineTo(x0, cy - fy);
      } else {
        // gap
        shape.lineTo(x0, cy - fy);
      }
    }

    // Create geometry
    const extrudeSettings = { depth: t / 100, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, material);
    // Position mesh according to side
    switch (side) {
      case "front":
        mesh.position.z = (this.props.depth - t) / 200;
        mesh.position.y = t / 200;
        break;
      case "back":
        mesh.position.z = -(this.props.depth - t) / 200;
        mesh.position.y = t / 200;
        break;
      case "left":
        mesh.rotation.y = Math.PI / 2;
        mesh.position.x = -(this.props.width - t) / 200;
        mesh.position.y = t / 200;
        break;
      case "right":
        mesh.rotation.y = Math.PI / 2;
        mesh.position.x = (this.props.width - t) / 200;
        mesh.position.y = t / 200;
        break;
      case "bottom":
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = -(this.props.height - t) / 200;
        break;
    }
    this.addEdges(mesh);
    return mesh;
  }

  private addEdges(board: THREE.Mesh) {
    const edges = new THREE.EdgesGeometry(board.geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    board.add(wireframe);
  }
}
