import * as THREE from "three";
import { ThreeDObject } from "./ThreeDObject";

interface BoxProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  jointType: "flat" | "finger";
}

export class Box implements ThreeDObject {
  constructor(private props: BoxProps) {}

  createMesh(): THREE.Group {
    const { width, height, depth, thickness } = this.props;
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: 0x9b87f5,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.8,
    });

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

    return group;
  }

  private addEdges(board: THREE.Mesh) {
    const edges = new THREE.EdgesGeometry(board.geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    board.add(wireframe);
  }
}
