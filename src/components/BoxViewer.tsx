import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore: Importing JS module with types provided by @types/three
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box } from "@/models/Box";

interface BoxViewerProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  jointType: "flat" | "finger";
  boxType: "open" | "closed";
  fingerSize?: number;
}

const BoxViewer = ({
  width,
  height,
  depth,
  thickness,
  jointType,
  boxType,
  fingerSize,
}: BoxViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const originalMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(
    null
  );
  const [selectedComponentName, setSelectedComponentName] = useState<
    string | null
  >(null);
  const [showLegend, setShowLegend] = useState(false);

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

    const rendererDomElement = renderer.domElement;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;

    let mouseDownPosition = { x: 0, y: 0 };
    let hasMoved = false;
    const DRAG_THRESHOLD = 3; // pixels

    const handlePointerDown = (event: PointerEvent) => {
      mouseDownPosition.x = event.clientX;
      mouseDownPosition.y = event.clientY;
      hasMoved = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = Math.abs(event.clientX - mouseDownPosition.x);
      const deltaY = Math.abs(event.clientY - mouseDownPosition.y);

      if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
        hasMoved = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (hasMoved) {
        return;
      }

      if (
        !mountRef.current ||
        !cameraRef.current ||
        !sceneRef.current ||
        !boxRef.current
      )
        return;

      // Restore previous selection
      if (selectedObjectRef.current && originalMaterialRef.current) {
        (selectedObjectRef.current as THREE.Mesh).material =
          originalMaterialRef.current;
        selectedObjectRef.current = null;
        originalMaterialRef.current = null;
      }

      // Get the canvas element for proper coordinate calculation
      const canvas = rendererRef.current?.domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      // Only intersect with main mesh objects (not their wireframe children)
      const meshes = boxRef.current.children.filter(
        (child) => child instanceof THREE.Mesh
      );
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const targetMesh = intersects[0].object as THREE.Mesh;

        selectedObjectRef.current = targetMesh;
        originalMaterialRef.current = targetMesh.material;

        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00, // yellow highlight
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        targetMesh.material = highlightMaterial;

        // Extract component name and show legend
        const componentName =
          targetMesh.userData.componentName || "Unknown Panel";
        setSelectedComponentName(componentName);
        setShowLegend(true);
      } else {
        // Clicked on empty space - hide legend
        setShowLegend(false);
        setSelectedComponentName(null);
      }
    };

    rendererDomElement.addEventListener("pointerdown", handlePointerDown);
    rendererDomElement.addEventListener("pointermove", handlePointerMove);
    rendererDomElement.addEventListener("pointerup", handlePointerUp);

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
      rendererDomElement.removeEventListener("pointerdown", handlePointerDown);
      rendererDomElement.removeEventListener("pointermove", handlePointerMove);
      rendererDomElement.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Update box dimensions
  useEffect(() => {
    if (!sceneRef.current) return;

    if (boxRef.current) {
      sceneRef.current.remove(boxRef.current);
    }

    const box = new Box({
      width,
      height,
      depth,
      thickness,
      jointType,
      boxType,
      fingerSize,
    });
    const group = box.createMesh();

    boxRef.current = group;
    sceneRef.current.add(group);
  }, [width, height, depth, thickness, jointType, boxType, fingerSize]);

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

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {showLegend && selectedComponentName && (
        <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">
              {selectedComponentName}
            </h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-200 text-sm ml-3"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxViewer;
