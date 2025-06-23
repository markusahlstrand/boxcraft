import { useState, useEffect } from "react";
import BoxViewer from "@/components/BoxViewer";
import BoxControls from "@/components/BoxControls";
import { useToast } from "@/components/ui/use-toast";
import { Github } from "lucide-react";
import Drawing from "dxf-writer";

const Index = () => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [depth, setDepth] = useState(100);
  const [thickness, setThickness] = useState(10);
  const [jointType, setJointType] = useState<"flat" | "finger">("flat");
  const [boxType, setBoxType] = useState<"open" | "closed">("closed");
  const [units, setUnits] = useState<"mm" | "inch">("mm");
  const [fingerSize, setFingerSize] = useState(() => {
    const minSide = Math.min(width, height, depth);
    return Math.round(minSide * 0.3);
  });
  const { toast } = useToast();

  // Update fingerSize default if dimensions change and fingerSize was not manually set
  // Track if user has changed fingerSize
  const [fingerSizeTouched, setFingerSizeTouched] = useState(false);

  // Update fingerSize when dimensions change, unless user has set it
  useEffect(() => {
    if (!fingerSizeTouched) {
      const minSide = Math.min(width, height, depth);
      setFingerSize(Math.round(minSide * 0.3));
    }
  }, [width, height, depth, fingerSizeTouched]);

  // Handler to set fingerSize and mark as touched
  const handleFingerSizeChange = (size: number) => {
    setFingerSize(size);
    setFingerSizeTouched(true);
  };

  const handleExport = () => {
    const d = new Drawing();

    // Create a simple box outline in DXF format
    d.setUnits(units === "mm" ? "Millimeters" : "Inches");

    // Front face
    d.drawRect(0, 0, width, height);

    // Save the DXF file
    const blob = new Blob([d.toDxfString()], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "box.dxf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your box design has been exported as a DXF file.",
    });
  };

  return (
    <div className="flex h-screen relative">
      <div className="w-80 p-4 border-r border-border">
        <BoxControls
          width={width}
          height={height}
          depth={depth}
          thickness={thickness}
          jointType={jointType}
          boxType={boxType}
          units={units}
          fingerSize={fingerSize}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
          onDepthChange={setDepth}
          onThicknessChange={setThickness}
          onJointTypeChange={setJointType}
          onBoxTypeChange={setBoxType}
          onUnitsChange={setUnits}
          onFingerSizeChange={handleFingerSizeChange}
          onExport={handleExport}
        />
      </div>
      <div className="flex-1">
        <BoxViewer
          width={width}
          height={height}
          depth={depth}
          thickness={thickness}
          jointType={jointType}
          boxType={boxType}
          fingerSize={fingerSize}
        />
      </div>

      {/* GitHub link at bottom left */}
      <a
        href="https://github.com/markusahlstrand/boxcraft"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 p-2 bg-background border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
        title="View on GitHub"
      >
        <Github className="h-5 w-5" />
      </a>
    </div>
  );
};

export default Index;
