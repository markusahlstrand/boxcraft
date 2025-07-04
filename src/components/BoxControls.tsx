import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface BoxControlsProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  jointType: "flat" | "finger";
  boxType: "open" | "closed";
  units: "mm" | "inch";
  fingerSize: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onDepthChange: (depth: number) => void;
  onThicknessChange: (depth: number) => void;
  onJointTypeChange: (type: "flat" | "finger") => void;
  onBoxTypeChange: (type: "open" | "closed") => void;
  onUnitsChange: (units: "mm" | "inch") => void;
  onFingerSizeChange: (size: number) => void;
  onExport: () => void;
}

const BoxControls = ({
  width,
  height,
  depth,
  thickness,
  jointType,
  boxType,
  units,
  fingerSize,
  onWidthChange,
  onHeightChange,
  onDepthChange,
  onThicknessChange,
  onJointTypeChange,
  onBoxTypeChange,
  onUnitsChange,
  onFingerSizeChange,
  onExport,
}: BoxControlsProps) => {
  return (
    <div className="box-controls p-6 rounded-lg space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Box Dimensions</h2>

        <div className="space-y-2">
          <Label htmlFor="units">Units</Label>
          <Select
            value={units}
            onValueChange={(value: "mm" | "inch") => onUnitsChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">Millimeters</SelectItem>
              <SelectItem value="inch">Inches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="boxType">Box Type</Label>
          <Select
            value={boxType}
            onValueChange={(value: "open" | "closed") => onBoxTypeChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select box type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closed">Closed Box</SelectItem>
              <SelectItem value="open">Open Box</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="width">Width ({units})</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height ({units})</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="depth">Depth ({units})</Label>
          <Input
            id="depth"
            type="number"
            value={depth}
            onChange={(e) => onDepthChange(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thickness">Thickness ({units})</Label>
          <Input
            id="thickness"
            type="number"
            value={thickness}
            onChange={(e) => onThicknessChange(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jointType">Edge Joints</Label>
          <Select
            value={jointType}
            onValueChange={(value: "flat" | "finger") =>
              onJointTypeChange(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select joint type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="finger">Finger</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {jointType === "finger" && (
          <div className="space-y-2">
            <Label htmlFor="fingerSize">Finger Size ({units})</Label>
            <Input
              id="fingerSize"
              type="number"
              value={fingerSize}
              onChange={(e) => onFingerSizeChange(Number(e.target.value))}
              min={1}
            />
          </div>
        )}
      </div>

      <Button className="w-full" onClick={onExport}>
        Export DXF
      </Button>
    </div>
  );
};

export default BoxControls;
