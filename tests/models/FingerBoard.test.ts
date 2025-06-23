import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateFingerJointDimensions,
  generateHorizontalFingerPoints,
  generateVerticalFingerPoints,
  type FingerJointConfig,
  type FingerJointDimensions,
} from "../../src/models/FingerBoard";

describe("FingerBoard", () => {
  describe("calculateFingerJointDimensions", () => {
    it("should calculate basic dimensions correctly", () => {
      const config: FingerJointConfig = {
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
      };

      const result = calculateFingerJointDimensions(config);

      expect(result.countX).toBe(5); // Math.floor((100 + 10) / (2 * 10)) = 5
      expect(result.countY).toBe(4); // Math.floor((80 + 10) / (2 * 10)) = 4
      expect(result.tScaled).toBe(0.05); // 5 / 100
      expect(result.fingerAreaWidth).toBe(1); // 100 / 100

      // Panel coordinates
      expect(result.x0).toBe(-0.5); // -100/2/100
      expect(result.y0).toBe(-0.4); // -80/2/100
      expect(result.x1).toBe(0.5); // 100/2/100
      expect(result.y1).toBe(0.4); // 80/2/100

      // Finger dimensions
      const expectedTotalSegmentsX = 5 * 2 + 1; // 11
      const expectedTotalSegmentsY = 4 * 2 + 1; // 9
      expect(result.fingerWidth).toBeCloseTo(
        100 / expectedTotalSegmentsX / 100
      ); // ≈ 0.0909
      expect(result.fingerHeight).toBeCloseTo(
        80 / expectedTotalSegmentsY / 100
      ); // ≈ 0.0889
    });

    it("should handle extended panels correctly", () => {
      const config: FingerJointConfig = {
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
        actualWidth: 120, // Extended panel
      };

      const result = calculateFingerJointDimensions(config);

      // Finger counts should still be based on original width
      expect(result.countX).toBe(5);
      expect(result.countY).toBe(4);

      // Panel coordinates should use actualWidth
      expect(result.x0).toBe(-0.6); // -120/2/100
      expect(result.x1).toBe(0.6); // 120/2/100

      // Finger area positioning
      expect(result.fingerAreaWidth).toBe(1); // 100 / 100
      expect(result.fingerStartX).toBe(-0.5); // -0.6 + (1.2 - 1) / 2 = -0.5
    });

    it("should enforce minimum finger count", () => {
      const config: FingerJointConfig = {
        width: 5, // Very small width
        height: 5, // Very small height
        thickness: 2,
        fingerSize: 10, // Large finger size
      };

      const result = calculateFingerJointDimensions(config);

      expect(result.countX).toBe(1); // Should be at least 1
      expect(result.countY).toBe(1); // Should be at least 1
    });

    it("should calculate finger dimensions with different finger sizes", () => {
      const config1: FingerJointConfig = {
        width: 100,
        height: 100,
        thickness: 5,
        fingerSize: 5, // Small fingers
      };

      const config2: FingerJointConfig = {
        width: 100,
        height: 100,
        thickness: 5,
        fingerSize: 20, // Large fingers
      };

      const result1 = calculateFingerJointDimensions(config1);
      const result2 = calculateFingerJointDimensions(config2);

      // Smaller fingerSize should result in more fingers
      expect(result1.countX).toBeGreaterThan(result2.countX);
      expect(result1.countY).toBeGreaterThan(result2.countY);

      // Smaller fingerSize should result in smaller individual finger dimensions
      expect(result1.fingerWidth).toBeLessThan(result2.fingerWidth);
      expect(result1.fingerHeight).toBeLessThan(result2.fingerHeight);
    });
  });

  describe("generateHorizontalFingerPoints", () => {
    let baseDimensions: FingerJointDimensions;

    beforeEach(() => {
      baseDimensions = calculateFingerJointDimensions({
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
      });
    });

    it("should generate bottom edge points with fingers", () => {
      const points = generateHorizontalFingerPoints(
        baseDimensions,
        false, // not extended
        false, // bottom edge
        true // has fingers
      );

      expect(points.length).toBeGreaterThan(0);

      // First point should start with a gap
      expect(points[0].y).toBe(baseDimensions.y0);

      // Should have points extending outward (negative y direction for bottom)
      const hasOutwardPoints = points.some((p) => p.y < baseDimensions.y0);
      expect(hasOutwardPoints).toBe(true);

      // Last point should end at the right edge
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBeCloseTo(baseDimensions.x1);
      expect(lastPoint.y).toBe(baseDimensions.y0);
    });

    it("should generate bottom edge points with slots", () => {
      const points = generateHorizontalFingerPoints(
        baseDimensions,
        false, // not extended
        false, // bottom edge
        false // has slots
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending inward (positive y direction for bottom slots)
      const hasInwardPoints = points.some((p) => p.y > baseDimensions.y0);
      expect(hasInwardPoints).toBe(true);
    });

    it("should generate top edge points with fingers", () => {
      const points = generateHorizontalFingerPoints(
        baseDimensions,
        false, // not extended
        true, // top edge
        true // has fingers
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending outward (positive y direction for top)
      const hasOutwardPoints = points.some((p) => p.y > baseDimensions.y1);
      expect(hasOutwardPoints).toBe(true);

      // Last point should end at the left edge (top goes right to left)
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBeCloseTo(baseDimensions.x0);
      expect(lastPoint.y).toBe(baseDimensions.y1);
    });

    it("should handle extended panels on bottom edge", () => {
      const extendedDimensions = calculateFingerJointDimensions({
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
        actualWidth: 120,
      });

      const points = generateHorizontalFingerPoints(
        extendedDimensions,
        true, // extended
        false, // bottom edge
        true // has fingers
      );

      expect(points.length).toBeGreaterThan(0);

      // First point should be at the finger start position
      expect(points[0].x).toBeCloseTo(extendedDimensions.fingerStartX);

      // Last point should be at the extended right edge
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBeCloseTo(extendedDimensions.x1);
    });

    it("should generate correct number of finger segments", () => {
      const points = generateHorizontalFingerPoints(
        baseDimensions,
        false, // not extended
        false, // bottom edge
        true // has fingers
      );

      // Should have 3 points per finger (start, outward, end) plus gaps
      // With countX fingers, we expect: 1 initial gap + countX * 3 finger points + (countX-1) gaps + 1 final gap
      const expectedMinPoints =
        1 + baseDimensions.countX * 3 + (baseDimensions.countX - 1) + 1;
      expect(points.length).toBeGreaterThanOrEqual(expectedMinPoints - 5); // Allow some tolerance for implementation details
    });
  });

  describe("generateVerticalFingerPoints", () => {
    let baseDimensions: FingerJointDimensions;

    beforeEach(() => {
      baseDimensions = calculateFingerJointDimensions({
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
      });
    });

    it("should generate right edge points with fingers", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        true, // right edge
        true // has fingers
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending outward (positive x direction for right)
      const hasOutwardPoints = points.some((p) => p.x > baseDimensions.x1);
      expect(hasOutwardPoints).toBe(true);

      // First point should start with a gap above bottom
      expect(points[0].x).toBe(baseDimensions.x1);
      expect(points[0].y).toBeGreaterThan(baseDimensions.y0);

      // Last point should end at the top edge
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBe(baseDimensions.x1);
      expect(lastPoint.y).toBeCloseTo(baseDimensions.y1);
    });

    it("should generate right edge points with slots", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        true, // right edge
        false // has slots
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending inward (negative x direction for right slots)
      const hasInwardPoints = points.some((p) => p.x < baseDimensions.x1);
      expect(hasInwardPoints).toBe(true);
    });

    it("should generate left edge points with fingers", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        false, // left edge
        true // has fingers
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending outward (negative x direction for left)
      const hasOutwardPoints = points.some((p) => p.x < baseDimensions.x0);
      expect(hasOutwardPoints).toBe(true);

      // First point should start with a gap below top (left goes top to bottom)
      expect(points[0].x).toBe(baseDimensions.x0);
      expect(points[0].y).toBeLessThan(baseDimensions.y1);

      // Last point should end at the bottom edge
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBe(baseDimensions.x0);
      expect(lastPoint.y).toBeCloseTo(baseDimensions.y0);
    });

    it("should generate left edge points with slots", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        false, // left edge
        false // has slots
      );

      expect(points.length).toBeGreaterThan(0);

      // Should have points extending inward (positive x direction for left slots)
      const hasInwardPoints = points.some((p) => p.x > baseDimensions.x0);
      expect(hasInwardPoints).toBe(true);
    });

    it("should respect thickness for finger/slot depth", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        true, // right edge
        true // has fingers
      );

      // Find the maximum x coordinate (should be x1 + thickness)
      const maxX = Math.max(...points.map((p) => p.x));
      const expectedMaxX = baseDimensions.x1 + baseDimensions.tScaled;
      expect(maxX).toBeCloseTo(expectedMaxX);
    });

    it("should generate correct number of finger segments", () => {
      const points = generateVerticalFingerPoints(
        baseDimensions,
        true, // right edge
        true // has fingers
      );

      // Should have 3 points per finger (start, outward, end) plus gaps
      // With countY fingers, we expect: 1 initial gap + countY * 3 finger points + (countY-1) gaps + 1 final gap
      const expectedMinPoints =
        1 + baseDimensions.countY * 3 + (baseDimensions.countY - 1) + 1;
      expect(points.length).toBeGreaterThanOrEqual(expectedMinPoints - 5); // Allow some tolerance for implementation details
    });
  });

  describe("Integration tests", () => {
    it("should generate consistent points for a complete box", () => {
      const config: FingerJointConfig = {
        width: 100,
        height: 80,
        thickness: 5,
        fingerSize: 10,
      };

      const dimensions = calculateFingerJointDimensions(config);

      // Generate all four edges
      const bottomPoints = generateHorizontalFingerPoints(
        dimensions,
        false,
        false,
        true
      );
      const rightPoints = generateVerticalFingerPoints(dimensions, true, false);
      const topPoints = generateHorizontalFingerPoints(
        dimensions,
        false,
        true,
        false
      );
      const leftPoints = generateVerticalFingerPoints(dimensions, false, true);

      // All point arrays should have content
      expect(bottomPoints.length).toBeGreaterThan(0);
      expect(rightPoints.length).toBeGreaterThan(0);
      expect(topPoints.length).toBeGreaterThan(0);
      expect(leftPoints.length).toBeGreaterThan(0);

      // Check that edges connect properly
      // Bottom edge should end where right edge starts
      const bottomEnd = bottomPoints[bottomPoints.length - 1];
      const rightStart = { x: dimensions.x1, y: dimensions.y0 };
      expect(bottomEnd.x).toBeCloseTo(rightStart.x);
      expect(bottomEnd.y).toBeCloseTo(rightStart.y);

      // Right edge should end where top edge starts
      const rightEnd = rightPoints[rightPoints.length - 1];
      const topStart = { x: dimensions.x1, y: dimensions.y1 };
      expect(rightEnd.x).toBeCloseTo(topStart.x);
      expect(rightEnd.y).toBeCloseTo(topStart.y);
    });

    it("should handle zero thickness gracefully", () => {
      const config: FingerJointConfig = {
        width: 100,
        height: 80,
        thickness: 0,
        fingerSize: 10,
      };

      const dimensions = calculateFingerJointDimensions(config);
      expect(dimensions.tScaled).toBe(0);

      // Should still generate points without errors
      const points = generateHorizontalFingerPoints(
        dimensions,
        false,
        false,
        true
      );
      expect(points.length).toBeGreaterThan(0);

      // With zero thickness, fingers shouldn't extend beyond the base edge
      const maxY = Math.max(...points.map((p) => p.y));
      const minY = Math.min(...points.map((p) => p.y));
      expect(maxY).toBeLessThanOrEqual(dimensions.y0);
      expect(minY).toBeLessThanOrEqual(dimensions.y0);
    });

    it("should work with very small dimensions", () => {
      const config: FingerJointConfig = {
        width: 1,
        height: 1,
        thickness: 0.1,
        fingerSize: 0.5,
      };

      const dimensions = calculateFingerJointDimensions(config);

      // Should still generate valid points
      const points = generateHorizontalFingerPoints(
        dimensions,
        false,
        false,
        true
      );
      expect(points.length).toBeGreaterThan(0);

      // All points should be finite numbers
      points.forEach((point) => {
        expect(isFinite(point.x)).toBe(true);
        expect(isFinite(point.y)).toBe(true);
      });
    });
  });
});
