import * as THREE from "three";

export interface FingerBoardProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  fingerSize: number;
}

export interface FingerPatterns {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export type FingerBoardSide =
  | "front"
  | "back"
  | "left"
  | "right"
  | "bottom"
  | "top";

/**
 * Configuration for finger joint calculations
 */
export interface FingerJointConfig {
  width: number;
  height: number;
  thickness: number;
  fingerSize: number;
  actualWidth?: number;
}

/**
 * Calculated finger joint dimensions
 */
export interface FingerJointDimensions {
  countX: number;
  countY: number;
  fingerWidth: number;
  fingerHeight: number;
  fingerAreaWidth: number;
  fingerStartX: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  tScaled: number;
}

/**
 * Calculate finger joint dimensions based on configuration
 */
export function calculateFingerJointDimensions(
  config: FingerJointConfig
): FingerJointDimensions {
  const { width, height, thickness, fingerSize, actualWidth } = config;

  const panelWidth = actualWidth || width;
  const x0 = -panelWidth / 2 / 100;
  const y0 = -height / 2 / 100;
  const x1 = panelWidth / 2 / 100;
  const y1 = height / 2 / 100;
  const tScaled = thickness / 100;

  // Calculate finger count to respect the desired finger size
  // Each finger needs 2 * fingerSize (one for the finger, one for the gap)
  // Plus we need one additional gap at the end
  const countX = Math.max(
    1,
    Math.floor((width + fingerSize) / (2 * fingerSize))
  );
  const countY = Math.max(
    1,
    Math.floor((height + fingerSize) / (2 * fingerSize))
  );

  // Calculate precise finger and gap dimensions based on finger joint area
  const totalSegmentsX = countX * 2 + 1;
  const totalSegmentsY = countY * 2 + 1;

  const fingerWidth = width / totalSegmentsX / 100; // Based on finger joint width
  const fingerHeight = height / totalSegmentsY / 100;

  // Calculate the offset for centering fingers on extended panels
  const fingerAreaWidth = width / 100;
  const fingerStartX = x0 + (panelWidth / 100 - fingerAreaWidth) / 2;

  return {
    countX,
    countY,
    fingerWidth,
    fingerHeight,
    fingerAreaWidth,
    fingerStartX,
    x0,
    y0,
    x1,
    y1,
    tScaled,
  };
}

/**
 * Generate finger/slot points for horizontal edges (top/bottom)
 */
export function generateHorizontalFingerPoints(
  dimensions: FingerJointDimensions,
  isExtended: boolean,
  isTop: boolean,
  hasFingers: boolean
): { x: number; y: number }[] {
  const { countX, fingerWidth, fingerStartX, x0, x1, y0, y1, tScaled } =
    dimensions;
  const points: { x: number; y: number }[] = [];

  const yPos = isTop ? y1 : y0;
  const fingerDirection = isTop ? 1 : -1; // +1 for top (upward), -1 for bottom (downward)

  if (isExtended) {
    // For extended panels, start from the finger area
    let currentX = isTop
      ? fingerStartX + dimensions.fingerAreaWidth
      : fingerStartX;
    const xDirection = isTop ? -1 : 1; // Top goes right to left, bottom goes left to right

    if (!isTop) {
      // Bottom edge: draw solid left extension first
      points.push({ x: fingerStartX, y: yPos });
    }

    // Start with gap
    currentX += xDirection * fingerWidth;
    points.push({ x: currentX, y: yPos });

    for (let i = 0; i < countX; i++) {
      if (hasFingers) {
        // Finger extends outward
        points.push({ x: currentX, y: yPos + fingerDirection * tScaled });
        points.push({
          x: currentX + xDirection * fingerWidth,
          y: yPos + fingerDirection * tScaled,
        });
        points.push({ x: currentX + xDirection * fingerWidth, y: yPos });
      } else {
        // Slot cuts inward
        points.push({ x: currentX, y: yPos - fingerDirection * tScaled });
        points.push({
          x: currentX + xDirection * fingerWidth,
          y: yPos - fingerDirection * tScaled,
        });
        points.push({ x: currentX + xDirection * fingerWidth, y: yPos });
      }
      currentX += xDirection * fingerWidth; // End of finger

      if (i < countX - 1) {
        // Gap between fingers
        currentX += xDirection * fingerWidth;
        points.push({ x: currentX, y: yPos });
      }
    }

    // End with gap
    currentX += xDirection * fingerWidth;
    if (isTop) {
      points.push({ x: x0, y: yPos });
    } else {
      points.push({ x: x1, y: yPos });
    }
  } else {
    // Normal panel - fingers span full width
    let currentX = isTop ? x1 : x0;
    const xDirection = isTop ? -1 : 1; // Top goes right to left, bottom goes left to right

    // Start with gap
    currentX += xDirection * fingerWidth;
    points.push({ x: currentX, y: yPos });

    for (let i = 0; i < countX; i++) {
      if (hasFingers) {
        // Finger extends outward
        points.push({ x: currentX, y: yPos + fingerDirection * tScaled });
        points.push({
          x: currentX + xDirection * fingerWidth,
          y: yPos + fingerDirection * tScaled,
        });
        points.push({ x: currentX + xDirection * fingerWidth, y: yPos });
      } else {
        // Slot cuts inward
        points.push({ x: currentX, y: yPos - fingerDirection * tScaled });
        points.push({
          x: currentX + xDirection * fingerWidth,
          y: yPos - fingerDirection * tScaled,
        });
        points.push({ x: currentX + xDirection * fingerWidth, y: yPos });
      }
      currentX += xDirection * fingerWidth; // End of finger

      if (i < countX - 1) {
        // Gap between fingers
        currentX += xDirection * fingerWidth;
        points.push({ x: currentX, y: yPos });
      }
    }

    // End with gap
    currentX += xDirection * fingerWidth;
    const endX = isTop ? x0 : x1;
    points.push({ x: endX, y: yPos });
  }

  return points;
}

/**
 * Generate finger/slot points for vertical edges (left/right)
 */
export function generateVerticalFingerPoints(
  dimensions: FingerJointDimensions,
  isRight: boolean,
  hasFingers: boolean
): { x: number; y: number }[] {
  const { countY, fingerHeight, x0, x1, y0, y1, tScaled } = dimensions;
  const points: { x: number; y: number }[] = [];

  const xPos = isRight ? x1 : x0;
  const fingerDirection = isRight ? 1 : -1; // +1 for right (rightward), -1 for left (leftward)
  const yDirection = isRight ? 1 : -1; // Right goes bottom to top, left goes top to bottom

  let currentY = isRight ? y0 : y1;

  // Start with gap
  currentY += yDirection * fingerHeight;
  points.push({ x: xPos, y: currentY });

  for (let i = 0; i < countY; i++) {
    if (hasFingers) {
      // Finger extends outward
      points.push({ x: xPos + fingerDirection * tScaled, y: currentY });
      points.push({
        x: xPos + fingerDirection * tScaled,
        y: currentY + yDirection * fingerHeight,
      });
      points.push({ x: xPos, y: currentY + yDirection * fingerHeight });
    } else {
      // Slot cuts inward
      points.push({ x: xPos - fingerDirection * tScaled, y: currentY });
      points.push({
        x: xPos - fingerDirection * tScaled,
        y: currentY + yDirection * fingerHeight,
      });
      points.push({ x: xPos, y: currentY + yDirection * fingerHeight });
    }
    currentY += yDirection * fingerHeight; // End of finger

    if (i < countY - 1) {
      // Gap between fingers
      currentY += yDirection * fingerHeight;
      points.push({ x: xPos, y: currentY });
    }
  }

  // End with gap
  currentY += yDirection * fingerHeight;
  const endY = isRight ? y1 : y0;
  points.push({ x: xPos, y: endY });

  return points;
}

export class FingerBoard {
  constructor(private props: FingerBoardProps) {}

  /**
   * Create a board with finger joints on the edges.
   * side: 'front' | 'back' | 'left' | 'right' | 'bottom'
   * actualWidth: optional override for the actual panel width (for extended panels)
   */
  createFingerBoard(
    w: number,
    h: number,
    t: number,
    side: FingerBoardSide,
    fingerSize: number,
    material: THREE.Material,
    actualWidth?: number
  ): THREE.Mesh {
    const shape = new THREE.Shape();

    // Calculate all finger joint dimensions
    const dimensions = calculateFingerJointDimensions({
      width: w,
      height: h,
      thickness: t,
      fingerSize,
      actualWidth,
    });

    const { x0, y0, x1, y1 } = dimensions;
    const isExtended = actualWidth && actualWidth > w;

    // Define finger patterns based on side
    const patterns = this.getFingerPatterns(side);

    // Start shape at bottom-left
    shape.moveTo(x0, y0);

    // Bottom edge (from left to right)
    const bottomPoints = generateHorizontalFingerPoints(
      dimensions,
      !!isExtended,
      false, // isTop = false for bottom edge
      patterns.bottom
    );
    bottomPoints.forEach((point) => shape.lineTo(point.x, point.y));

    // Right edge (from bottom to top)
    const rightPoints = generateVerticalFingerPoints(
      dimensions,
      true, // isRight = true
      patterns.right
    );
    rightPoints.forEach((point) => shape.lineTo(point.x, point.y));

    // Top edge (from right to left)
    const topPoints = generateHorizontalFingerPoints(
      dimensions,
      !!isExtended,
      true, // isTop = true for top edge
      patterns.top
    );
    topPoints.forEach((point) => shape.lineTo(point.x, point.y));

    // Left edge (from top to bottom)
    const leftPoints = generateVerticalFingerPoints(
      dimensions,
      false, // isRight = false for left edge
      patterns.left
    );
    leftPoints.forEach((point) => shape.lineTo(point.x, point.y));

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
      case "top":
        mesh.rotation.x = Math.PI / 2;
        // Top panel: positioned at top with proper clearance for finger joints
        mesh.position.y = (this.props.height / 2 - t) / 100;
        break;
    }

    this.addEdges(mesh);
    return mesh;
  }

  /**
   * Define finger patterns for each side of the box.
   * Returns which edges should have fingers (true) vs slots (false).
   */
  private getFingerPatterns(side: FingerBoardSide): FingerPatterns {
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
      case "top":
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
