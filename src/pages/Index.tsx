import { useState } from "react";
import BoxViewer from "@/components/BoxViewer";
import BoxControls from "@/components/BoxControls";
import { useToast } from "@/components/ui/use-toast";
import Drawing from "dxf-writer";

const Index = () => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [depth, setDepth] = useState(100);
  const [jointType, setJointType] = useState<'flat' | 'finger'>('flat');
  const [units, setUnits] = useState<'mm' | 'inch'>('mm');
  const { toast } = useToast();

  const handleExport = () => {
    const d = new Drawing();
    
    // Create a simple box outline in DXF format
    d.setUnits(units === 'mm' ? 'Millimeters' : 'Inches');
    
    // Front face
    d.drawRect(0, 0, width, height);
    
    // Save the DXF file
    const blob = new Blob([d.toDxfString()], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'box.dxf';
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
    <div className="flex h-screen">
      <div className="w-80 p-4 border-r border-border">
        <BoxControls
          width={width}
          height={height}
          depth={depth}
          jointType={jointType}
          units={units}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
          onDepthChange={setDepth}
          onJointTypeChange={setJointType}
          onUnitsChange={setUnits}
          onExport={handleExport}
        />
      </div>
      <div className="flex-1">
        <BoxViewer
          width={width}
          height={height}
          depth={depth}
          jointType={jointType}
        />
      </div>
    </div>
  );
};

export default Index;