import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface BoxViewerProps {
  width: number;
  height: number;
  depth: number;
  thickness: number; // Add this
  jointType: "flat" | "finger";
}

const BoxViewer = ({
  width,
  height,
  depth,
  thickness,
  jointType,
}: BoxViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxRef = useRef<THREE.Mesh | THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color("#1A1F2C");

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(2, 2, 1);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update box dimensions
  useEffect(() => {
    if (!sceneRef.current) return;

    if (boxRef.current) {
      sceneRef.current.remove(boxRef.current);
    }

    const group = new THREE.Group();

    // Front board
    const frontGeometry = new THREE.BoxGeometry(
      width / 100,
      height / 100,
      thickness / 100
    );
    const material = new THREE.MeshBasicMaterial({ color: 0x9b87f5 });
    const frontBoard = new THREE.Mesh(frontGeometry, material);
    frontBoard.position.z = depth / 200; // Half of depth
    addEdges(frontBoard);
    group.add(frontBoard);

    // Back board
    const backBoard = frontBoard.clone();
    backBoard.position.z = -depth / 200;
    addEdges(backBoard);
    group.add(backBoard);

    // Left board
    const leftGeometry = new THREE.BoxGeometry(
      thickness / 100,
      height / 100,
      depth / 100
    );
    const leftBoard = new THREE.Mesh(leftGeometry, material);
    leftBoard.position.x = -width / 200;
    addEdges(leftBoard);
    group.add(leftBoard);

    // Right board
    const rightBoard = leftBoard.clone();
    rightBoard.position.x = width / 200;
    addEdges(rightBoard);
    group.add(rightBoard);

    // Top board
    const topGeometry = new THREE.BoxGeometry(
      width / 100,
      thickness / 100,
      depth / 100
    );
    const topBoard = new THREE.Mesh(topGeometry, material);
    topBoard.position.y = height / 200;
    addEdges(topBoard);
    group.add(topBoard);

    // Bottom board
    const bottomBoard = topBoard.clone();
    bottomBoard.position.y = -height / 200;
    addEdges(bottomBoard);
    group.add(bottomBoard);

    function addEdges(board: THREE.Mesh) {
      const edges = new THREE.EdgesGeometry(board.geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const wireframe = new THREE.LineSegments(edges, edgeMaterial);
      board.add(wireframe);
    }

    boxRef.current = group;
    sceneRef.current.add(group);
  }, [width, height, depth, thickness, jointType]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current)
        return;

      cameraRef.current.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default BoxViewer;
