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
      // Use finger joint geometry for all sides with proper sizing compensation

      // Front panel: full width to reach outer edges, full height
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

      // Back panel: full width to reach outer edges, full height
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

      // Left panel: reduced depth (compensate for front/back thickness), full height
      group.add(
        this.createFingerBoard(
          depth - 2 * thickness,
          height,
          thickness,
          "left",
          fingerSize,
          material
        )
      );

      // Right panel: reduced depth (compensate for front/back thickness), full height
      group.add(
        this.createFingerBoard(
          depth - 2 * thickness,
          height,
          thickness,
          "right",
          fingerSize,
          material
        )
      );

      // Bottom panel: reduced width and depth to account for outward-extending fingers
      // The fingers extend outward by thickness, so we reduce the base panel size to keep
      // the total envelope within the specified width x depth dimensions
      group.add(
        this.createFingerBoard(
          width - 2 * thickness,
          depth - 2 * thickness,
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
      backBoard.userData.componentName = "Back Panel";
      backBoard.position.z = -(depth - thickness) / 200;
      backBoard.position.y = thickness / 200;
      this.addEdges(backBoard);
      group.add(backBoard);

      // Front board
      const frontBoard = backBoard.clone();
      frontBoard.userData.componentName = "Front Panel";
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
      leftBoard.userData.componentName = "Left Panel";
      leftBoard.position.x = -(width - thickness) / 200;
      leftBoard.position.y = thickness / 200;
      this.addEdges(leftBoard);
      group.add(leftBoard);

      // Right board
      const rightBoard = leftBoard.clone();
      rightBoard.userData.componentName = "Right Panel";
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
      bottomBoard.userData.componentName = "Bottom Panel";
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

    // Calculate finger counts based on consistent reference dimensions for mating edges
    // Use the bottom panel's dimensions as reference since it determines the joint spacing
    let refWidth = this.props.width - 2 * this.props.thickness; // Bottom panel width
    let refDepth = this.props.depth - 2 * this.props.thickness; // Bottom panel depth

    // For width-direction fingers (front/back panels and bottom panel front/back edges)
    let countX = Math.floor(refWidth / fingerSize);
    if (countX % 2 === 0) countX++;

    // For depth-direction fingers (left/right panels and bottom panel left/right edges)
    let countY = Math.floor(refDepth / fingerSize);
    if (countY % 2 === 0) countY++;

    // Override for panels that need height-based finger calculation (vertical edges)
    if ((side === "front" || side === "back") && w !== refWidth) {
      // This is for the vertical edges of front/back panels
      countY = Math.floor(h / fingerSize);
      if (countY % 2 === 0) countY++;
    }
    if ((side === "left" || side === "right") && w !== refDepth) {
      // This is for the vertical edges of left/right panels
      countY = Math.floor(h / fingerSize);
      if (countY % 2 === 0) countY++;
    }

    // Adjust for proper centering with half-spaces at edges
    const totalSpacesX = countX + 1; // countX fingers + (countX+1) spaces
    const totalSpacesY = countY + 1; // countY fingers + (countY+1) spaces
    const fx = w / totalSpacesX / 100;
    const fy = h / totalSpacesY / 100;

    shape.moveTo(x0, y0);

    // Define finger patterns based on side
    const patterns = this.getFingerPatterns(side);

    // Bottom edge (from left to right)
    let x = x0;
    const segmentWidth = (x1 - x0) / (countX * 2 + 1); // Total segments: countX fingers + (countX+1) gaps

    // Start with half gap
    x += segmentWidth;
    shape.lineTo(x, y0);

    for (let i = 0; i < countX; i++) {
      if (patterns.bottom) {
        // Finger extends outward (downward)
        shape.lineTo(x, y0 - tScaled);
        shape.lineTo(x + segmentWidth, y0 - tScaled);
        shape.lineTo(x + segmentWidth, y0);
      } else {
        // Slot cuts inward (upward) - stays within the board
        shape.lineTo(x, y0 + tScaled);
        shape.lineTo(x + segmentWidth, y0 + tScaled);
        shape.lineTo(x + segmentWidth, y0);
      }
      x += segmentWidth; // End of finger

      if (i < countX - 1) {
        // Gap between fingers
        x += segmentWidth;
        shape.lineTo(x, y0);
      }
    }

    // End with half gap
    x += segmentWidth;
    shape.lineTo(x1, y0);

    // Right edge (from bottom to top)
    let y = y0;
    const segmentHeight = (y1 - y0) / (countY * 2 + 1); // Total segments: countY fingers + (countY+1) gaps

    // Start with half gap
    y += segmentHeight;
    shape.lineTo(x1, y);

    for (let i = 0; i < countY; i++) {
      if (patterns.right) {
        // Finger extends outward (rightward)
        shape.lineTo(x1 + tScaled, y);
        shape.lineTo(x1 + tScaled, y + segmentHeight);
        shape.lineTo(x1, y + segmentHeight);
      } else {
        // Slot cuts inward (leftward) - stays within the board
        shape.lineTo(x1 - tScaled, y);
        shape.lineTo(x1 - tScaled, y + segmentHeight);
        shape.lineTo(x1, y + segmentHeight);
      }
      y += segmentHeight; // End of finger

      if (i < countY - 1) {
        // Gap between fingers
        y += segmentHeight;
        shape.lineTo(x1, y);
      }
    }

    // End with half gap
    y += segmentHeight;
    shape.lineTo(x1, y1);

    // Top edge (from right to left)
    x = x1;

    // Start with half gap
    x -= segmentWidth;
    shape.lineTo(x, y1);

    for (let i = 0; i < countX; i++) {
      if (patterns.top) {
        // Finger extends outward (upward)
        shape.lineTo(x, y1 + tScaled);
        shape.lineTo(x - segmentWidth, y1 + tScaled);
        shape.lineTo(x - segmentWidth, y1);
      } else {
        // Slot cuts inward (downward) - stays within the board
        shape.lineTo(x, y1 - tScaled);
        shape.lineTo(x - segmentWidth, y1 - tScaled);
        shape.lineTo(x - segmentWidth, y1);
      }
      x -= segmentWidth; // End of finger

      if (i < countX - 1) {
        // Gap between fingers
        x -= segmentWidth;
        shape.lineTo(x, y1);
      }
    }

    // End with half gap
    x -= segmentWidth;
    shape.lineTo(x0, y1);

    // Left edge (from top to bottom)
    y = y1;

    // Start with half gap
    y -= segmentHeight;
    shape.lineTo(x0, y);

    for (let i = 0; i < countY; i++) {
      if (patterns.left) {
        // Finger extends outward (leftward)
        shape.lineTo(x0 - tScaled, y);
        shape.lineTo(x0 - tScaled, y - segmentHeight);
        shape.lineTo(x0, y - segmentHeight);
      } else {
        // Slot cuts inward (rightward) - stays within the board
        shape.lineTo(x0 + tScaled, y);
        shape.lineTo(x0 + tScaled, y - segmentHeight);
        shape.lineTo(x0, y - segmentHeight);
      }
      y -= segmentHeight; // End of finger

      if (i < countY - 1) {
        // Gap between fingers
        y -= segmentHeight;
        shape.lineTo(x0, y);
      }
    }

    // The shape automatically closes back to the starting point (x0, y0)

    // Create geometry
    const extrudeSettings = { depth: t / 100, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, material);

    // Add component name to mesh userData for identification
    const componentNames: { [key: string]: string } = {
      front: "Front Panel",
      back: "Back Panel",
      left: "Left Panel",
      right: "Right Panel",
      bottom: "Bottom Panel",
    };
    mesh.userData.componentName = componentNames[side] || "Unknown Panel";

    // Position mesh according to side with proper offsets for finger joints
    // All vertical panels use the same Y calculation for full height panels
    const verticalPanelY = 0; // Center the full-height panels vertically

    switch (side) {
      case "front":
        // Front panel: positioned to align with reduced bottom panel edge
        mesh.position.z =
          (this.props.depth - 2 * this.props.thickness) / 2 / 100;
        mesh.position.y = verticalPanelY;
        break;
      case "back":
        // Back panel: positioned to align with reduced bottom panel edge, offset by panel thickness
        mesh.position.z =
          -((this.props.depth - 2 * this.props.thickness) / 2 + t) / 100;
        mesh.position.y = verticalPanelY;
        break;
      case "left":
        mesh.rotation.y = Math.PI / 2;
        // Left panel: positioned to align with reduced bottom panel edge, offset by panel thickness
        mesh.position.x =
          -((this.props.width - 2 * this.props.thickness) / 2 + t) / 100;
        mesh.position.y = verticalPanelY;
        break;
      case "right":
        mesh.rotation.y = Math.PI / 2;
        // Right panel: positioned to align with reduced bottom panel edge
        mesh.position.x =
          (this.props.width - 2 * this.props.thickness) / 2 / 100;
        mesh.position.y = verticalPanelY;
        break;
      case "bottom":
        mesh.rotation.x = Math.PI / 2;
        // Bottom panel: positioned at bottom with proper clearance for finger joints
        // Using (height/2 - thickness) instead of (height/2 - thickness/2)
        // moves the panel down by thickness/2, closing the gap to the actual bottom
        mesh.position.y = -(this.props.height / 2 - t) / 100;
        break;
    }
    this.addEdges(mesh);
    return mesh;
  }

  /**
   * Define finger patterns for each side of the box.
   * Returns which edges should have fingers (true) vs slots (false).
   */
  private getFingerPatterns(side: string): {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  } {
    switch (side) {
      case "front":
        return {
          top: false, // slots on top to mate with top panel
          right: false, // slots on right to mate with left/right panels
          bottom: false, // slots on bottom to mate with bottom panel
          left: false, // slots on left to mate with left/right panels
        };
      case "back":
        return {
          top: false, // slots on top to mate with top panel
          right: false, // slots on right to mate with left/right panels
          bottom: false, // slots on bottom to mate with bottom panel
          left: false, // slots on left to mate with left/right panels
        };
      case "left":
        return {
          top: false, // slots on top to mate with top panel
          right: true, // fingers on right
          bottom: false, // slots on bottom to mate with bottom panel
          left: true, // fingers on left
        };
      case "right":
        return {
          top: false, // slots on top to mate with top panel
          right: true, // fingers on right
          bottom: false, // slots on bottom to mate with bottom panel
          left: true, // fingers on left
        };
      case "bottom":
        return {
          top: true, // fingers on all edges to mate with vertical panels
          right: true,
          bottom: true,
          left: true,
        };
      default:
        return { top: true, right: true, bottom: true, left: true };
    }
  }

  private addEdges(board: THREE.Mesh) {
    const edges = new THREE.EdgesGeometry(board.geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    board.add(wireframe);
  }
}
