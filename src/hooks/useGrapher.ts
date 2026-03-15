/**
 * useGrapher — Hook for the Interactive Graphing Labs feature.
 * Manages function list, viewport (zoom/pan), trace state, and color assignment.
 */

import { useState, useCallback, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface TracePoint {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
}

// ── Color Palette ─────────────────────────────────────────────────────────

const GRAPH_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#a855f7", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

let nextFunctionId = 0;

const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

// ── Hook ──────────────────────────────────────────────────────────────────

export function useGrapher() {
  const [functions, setFunctions] = useState<GraphFunction[]>([
    {
      id: String(++nextFunctionId),
      expression: "sin(x)",
      color: GRAPH_COLORS[0],
      visible: true,
    },
  ]);
  const [viewport, setViewport] = useState<Viewport>({ ...DEFAULT_VIEWPORT });
  const [traceEnabled, setTraceEnabled] = useState(true);
  const [tracePoint, setTracePoint] = useState<TracePoint | null>(null);
  const [angleDeg, setAngleDeg] = useState(true);

  // For drag tracking
  const dragRef = useRef<{ startX: number; startY: number; startVP: Viewport } | null>(null);

  const addFunction = useCallback(() => {
    setFunctions((prev) => {
      const colorIdx = prev.length % GRAPH_COLORS.length;
      return [
        ...prev,
        {
          id: String(++nextFunctionId),
          expression: "",
          color: GRAPH_COLORS[colorIdx],
          visible: true,
        },
      ];
    });
  }, []);

  const removeFunction = useCallback((id: string) => {
    setFunctions((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateExpression = useCallback((id: string, expression: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expression } : f))
    );
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  }, []);

  const resetView = useCallback(() => {
    setViewport({ ...DEFAULT_VIEWPORT });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport((vp) => {
      const cx = (vp.xMin + vp.xMax) / 2;
      const cy = (vp.yMin + vp.yMax) / 2;
      const hw = (vp.xMax - vp.xMin) / 4;
      const hh = (vp.yMax - vp.yMin) / 4;
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((vp) => {
      const cx = (vp.xMin + vp.xMax) / 2;
      const cy = (vp.yMin + vp.yMax) / 2;
      const hw = (vp.xMax - vp.xMin);
      const hh = (vp.yMax - vp.yMin);
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
  }, []);

  const handleWheel = useCallback((e: WheelEvent, canvasWidth: number, canvasHeight: number) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;

    setViewport((vp) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const mx = (e.clientX - rect.left) / canvasWidth;
      const my = (e.clientY - rect.top) / canvasHeight;

      const xRange = vp.xMax - vp.xMin;
      const yRange = vp.yMax - vp.yMin;
      const newXRange = xRange * factor;
      const newYRange = yRange * factor;

      // Zoom toward mouse position
      const xPivot = vp.xMin + mx * xRange;
      const yPivot = vp.yMax - my * yRange;

      return {
        xMin: xPivot - mx * newXRange,
        xMax: xPivot + (1 - mx) * newXRange,
        yMin: yPivot - (1 - my) * newYRange,
        yMax: yPivot + my * newYRange,
      };
    });
  }, []);

  const handleDragStart = useCallback(
    (x: number, y: number) => {
      dragRef.current = { startX: x, startY: y, startVP: { ...viewport } };
    },
    [viewport]
  );

  const handleDragMove = useCallback(
    (x: number, y: number, canvasWidth: number, canvasHeight: number) => {
      const drag = dragRef.current;
      if (!drag) return;

      const vp = drag.startVP;
      const dx = ((x - drag.startX) / canvasWidth) * (vp.xMax - vp.xMin);
      const dy = ((y - drag.startY) / canvasHeight) * (vp.yMax - vp.yMin);

      setViewport({
        xMin: vp.xMin - dx,
        xMax: vp.xMax - dx,
        yMin: vp.yMin + dy,
        yMax: vp.yMax + dy,
      });
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  const toggleAngle = useCallback(() => {
    setAngleDeg((prev) => !prev);
  }, []);

  return {
    functions,
    viewport,
    traceEnabled,
    tracePoint,
    angleDeg,
    addFunction,
    removeFunction,
    updateExpression,
    toggleVisibility,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setTracePoint,
    setTraceEnabled,
    toggleAngle,
  };
}
