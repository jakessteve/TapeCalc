/**
 * GraphView — Interactive Graphing Labs feature.
 * Canvas-based function plotter with multi-function support,
 * grid/axes, zoom/pan, and trace mode.
 */

import { useRef, useEffect, useCallback, memo } from "react";
import {
  LineChart,
  Plus,
  X,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
} from "lucide-react";
import { useGrapher, type GraphFunction, type Viewport } from "../hooks/useGrapher";
import { evaluateForGraph } from "../utils/mathEngine";

// ── Canvas Renderer ───────────────────────────────────────────────────────

function renderGraph(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  functions: GraphFunction[],
  viewport: Viewport,
  angleDeg: boolean,
  traceX: number | null,
  cssVars: { gridColor: string; axisColor: string; textColor: string; bgColor: string }
) {
  const { xMin, xMax, yMin, yMax } = viewport;
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  // Coordinate conversion
  const toScreenX = (x: number) => ((x - xMin) / xRange) * width;
  const toScreenY = (y: number) => ((yMax - y) / yRange) * height;
  const toMathX = (sx: number) => xMin + (sx / width) * xRange;

  // Clear
  ctx.fillStyle = cssVars.bgColor;
  ctx.fillRect(0, 0, width, height);

  // ── Grid Lines ────────────────────────────────────────────────────────

  // Calculate grid spacing — aim for ~50-80px between lines
  const gridSpacingX = niceStep(xRange / (width / 60));
  const gridSpacingY = niceStep(yRange / (height / 60));

  ctx.strokeStyle = cssVars.gridColor;
  ctx.lineWidth = 0.5;

  // Vertical grid lines
  const xStart = Math.ceil(xMin / gridSpacingX) * gridSpacingX;
  for (let gx = xStart; gx <= xMax; gx += gridSpacingX) {
    const sx = toScreenX(gx);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
  }

  // Horizontal grid lines
  const yStart = Math.ceil(yMin / gridSpacingY) * gridSpacingY;
  for (let gy = yStart; gy <= yMax; gy += gridSpacingY) {
    const sy = toScreenY(gy);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
    ctx.stroke();
  }

  // ── Axes ──────────────────────────────────────────────────────────────

  ctx.strokeStyle = cssVars.axisColor;
  ctx.lineWidth = 1.5;

  // X axis (y=0)
  if (yMin <= 0 && yMax >= 0) {
    const y0 = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(width, y0);
    ctx.stroke();
  }

  // Y axis (x=0)
  if (xMin <= 0 && xMax >= 0) {
    const x0 = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, height);
    ctx.stroke();
  }

  // ── Axis Labels ───────────────────────────────────────────────────────

  ctx.fillStyle = cssVars.textColor;
  ctx.font = "10px 'JetBrains Mono', 'SF Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // X axis labels
  const xAxisY = yMin <= 0 && yMax >= 0 ? toScreenY(0) : height;
  for (let gx = xStart; gx <= xMax; gx += gridSpacingX) {
    if (Math.abs(gx) < gridSpacingX * 0.01) continue; // skip 0
    const sx = toScreenX(gx);
    const label = formatAxisLabel(gx);
    ctx.fillText(label, sx, Math.min(xAxisY + 4, height - 14));
  }

  // Y axis labels
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const yAxisX = xMin <= 0 && xMax >= 0 ? toScreenX(0) : 0;
  for (let gy = yStart; gy <= yMax; gy += gridSpacingY) {
    if (Math.abs(gy) < gridSpacingY * 0.01) continue; // skip 0
    const sy = toScreenY(gy);
    const label = formatAxisLabel(gy);
    ctx.fillText(label, Math.max(yAxisX - 4, 30), sy);
  }

  // Origin label
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", toScreenX(0) - 4, toScreenY(0) + 4);
  }

  // ── Function Curves ───────────────────────────────────────────────────


  for (const fn of functions) {
    if (!fn.visible || !fn.expression.trim()) continue;

    ctx.strokeStyle = fn.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let lastValid = false;
    for (let i = 0; i <= width; i++) {
      const mx = xMin + (i / width) * xRange;
      const my = evaluateForGraph(fn.expression, mx, angleDeg);

      if (isNaN(my) || !isFinite(my) || my > yMax + yRange * 10 || my < yMin - yRange * 10) {
        lastValid = false;
        continue;
      }

      const sy = toScreenY(my);

      if (!lastValid) {
        ctx.moveTo(i, sy);
      } else {
        ctx.lineTo(i, sy);
      }
      lastValid = true;
    }
    ctx.stroke();
  }

  // ── Trace Crosshair ───────────────────────────────────────────────────

  if (traceX !== null) {
    const sx = traceX;
    const mx = toMathX(sx);

    // Vertical dashed line
    ctx.strokeStyle = cssVars.textColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Show value for each function
    let labelY = 16;
    for (const fn of functions) {
      if (!fn.visible || !fn.expression.trim()) continue;
      const my = evaluateForGraph(fn.expression, mx, angleDeg);
      if (isNaN(my) || !isFinite(my)) continue;

      const sy = toScreenY(my);

      // Dot on the curve
      ctx.fillStyle = fn.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Coordinate label
      ctx.fillStyle = fn.color;
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      const coordText = `(${mx.toFixed(2)}, ${my.toFixed(2)})`;
      const tx = sx + 8;
      ctx.fillText(coordText, tx > width - 120 ? sx - 120 : tx, labelY);
      labelY += 16;
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function niceStep(rough: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / pow;
  if (frac <= 1.5) return pow;
  if (frac <= 3.5) return 2 * pow;
  if (frac <= 7.5) return 5 * pow;
  return 10 * pow;
}

function formatAxisLabel(value: number): string {
  if (Math.abs(value) >= 1000) return value.toExponential(0);
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

// ── CSS Variable Reader ─────────────────────────────────────────────────

function getCSSVars(): { gridColor: string; axisColor: string; textColor: string; bgColor: string } {
  const style = getComputedStyle(document.documentElement);
  return {
    gridColor: style.getPropertyValue("--border-light").trim() || "rgba(255,255,255,0.06)",
    axisColor: style.getPropertyValue("--border-medium").trim() || "rgba(255,255,255,0.15)",
    textColor: style.getPropertyValue("--text-dim").trim() || "rgba(255,255,255,0.4)",
    bgColor: style.getPropertyValue("--bg-editor").trim() || "#1a1a2e",
  };
}

// ── Component ─────────────────────────────────────────────────────────────

const GraphCanvas = memo(function GraphCanvas({
  functions,
  viewport,
  angleDeg,
  traceEnabled,
  onWheel,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTraceMove,
  onTraceLeave,
}: {
  functions: GraphFunction[];
  viewport: Viewport;
  angleDeg: boolean;
  traceEnabled: boolean;
  onWheel: (e: WheelEvent, w: number, h: number) => void;
  onDragStart: (x: number, y: number) => void;
  onDragMove: (x: number, y: number, w: number, h: number) => void;
  onDragEnd: () => void;
  onTraceMove: (sx: number, mx: number) => void;
  onTraceLeave: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const traceX = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    renderGraph(ctx, w, h, functions, viewport, angleDeg, traceX.current, getCSSVars());
  }, [functions, viewport, angleDeg]);

  // Re-draw on state change
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e: WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      onWheel(e, rect.width, rect.height);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      onDragStart(e.clientX, e.clientY);
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      if (isDragging.current) {
        onDragMove(e.clientX, e.clientY, w, rect.height);
      }
      if (traceEnabled && !isDragging.current) {
        const sx = e.clientX - rect.left;
        traceX.current = sx;

        // Accurate math coordinate
        const mx = viewport.xMin + (sx / w) * (viewport.xMax - viewport.xMin);

        onTraceMove(sx, mx);
        // Trigger re-render for trace
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      onDragEnd();
      canvas.style.cursor = traceEnabled ? "crosshair" : "grab";
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      traceX.current = null;
      onDragEnd();
      onTraceLeave();
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(draw);
      canvas.style.cursor = traceEnabled ? "crosshair" : "grab";
    };

    canvas.addEventListener("wheel", handleWheelEvent, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    canvas.style.cursor = traceEnabled ? "crosshair" : "grab";

    return () => {
      canvas.removeEventListener("wheel", handleWheelEvent);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [traceEnabled, onWheel, onDragStart, onDragMove, onDragEnd, onTraceMove, onTraceLeave, draw]);

  return (
    <div ref={containerRef} className="graph-canvas-container">
      <canvas ref={canvasRef} className="graph-canvas" />
    </div>
  );
});

export function GraphView() {
  const grapher = useGrapher();

  const handleTraceMove = useCallback((sx: number, mx: number) => {
    // Pick the first visible function to follow for the state-based trace point
    const firstFn = grapher.functions.find(f => f.visible && f.expression.trim());
    let my = 0;
    if (firstFn) {
      my = evaluateForGraph(firstFn.expression, mx, grapher.angleDeg);
    }
    grapher.setTracePoint({ x: mx, y: my, screenX: sx, screenY: 0 });
  }, [grapher.functions, grapher.angleDeg, grapher.setTracePoint]);

  const handleTraceLeave = useCallback(() => {
    grapher.setTracePoint(null);
  }, [grapher.setTracePoint]);

  return (
    <div
      className="graph-layout flex flex-1 min-h-0 animate-tab-enter"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Left sidebar — function list */}
      <div className="graph-sidebar">
        <div className="graph-sidebar__header">
          <div className="flex items-center gap-2">
            <div
              className="title-icon"
              style={{ width: 28, height: 28, fontSize: 12 }}
            >
              <LineChart size={14} />
            </div>
            <span className="text-xs font-bold text-primary">Functions</span>
          </div>
          <button
            onClick={grapher.addFunction}
            className="graph-add-btn focus-ring"
            title="Add function"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="graph-fn-list">
          {grapher.functions.map((fn, i) => (
            <div key={fn.id} className="graph-fn-item">
              <div
                className="graph-fn-color"
                style={{ background: fn.color }}
              />
              <div className="graph-fn-input-wrap">
                <span className="graph-fn-prefix">f{i + 1}(x) =</span>
                <input
                  value={fn.expression}
                  onChange={(e) =>
                    grapher.updateExpression(fn.id, e.target.value)
                  }
                  className="graph-fn-input focus-ring"
                  placeholder="e.g. sin(x)"
                  spellCheck={false}
                />
              </div>
              <button
                onClick={() => grapher.toggleVisibility(fn.id)}
                className="graph-fn-vis focus-ring"
                title={fn.visible ? "Hide" : "Show"}
              >
                {fn.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              {grapher.functions.length > 1 && (
                <button
                  onClick={() => grapher.removeFunction(fn.id)}
                  className="graph-fn-remove focus-ring"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Viewport info */}
        <div className="graph-viewport-info">
          <div className="text-[10px] text-dim font-mono">
            x: [{grapher.viewport.xMin.toFixed(1)}, {grapher.viewport.xMax.toFixed(1)}]
          </div>
          <div className="text-[10px] text-dim font-mono">
            y: [{grapher.viewport.yMin.toFixed(1)}, {grapher.viewport.yMax.toFixed(1)}]
          </div>
        </div>

        {/* Angle mode */}
        <button
          onClick={grapher.toggleAngle}
          className="solver-angle-btn focus-ring"
          style={{ margin: "0 12px 8px", fontSize: 10 }}
          title={`Angle: ${grapher.angleDeg ? "Degrees" : "Radians"}`}
        >
          {grapher.angleDeg ? "DEG" : "RAD"}
        </button>
      </div>

      {/* Main graph area */}
      <div className="graph-main">
        <GraphCanvas
          functions={grapher.functions}
          viewport={grapher.viewport}
          angleDeg={grapher.angleDeg}
          traceEnabled={grapher.traceEnabled}
          onWheel={grapher.handleWheel}
          onDragStart={grapher.handleDragStart}
          onDragMove={grapher.handleDragMove}
          onDragEnd={grapher.handleDragEnd}
          onTraceMove={handleTraceMove}
          onTraceLeave={handleTraceLeave}
        />

        {/* Bottom toolbar */}
        <div className="graph-toolbar">
          <button
            onClick={grapher.zoomIn}
            className="graph-tool-btn focus-ring"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={grapher.zoomOut}
            className="graph-tool-btn focus-ring"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={grapher.resetView}
            className="graph-tool-btn focus-ring"
            title="Reset view"
          >
            <RotateCcw size={14} />
          </button>
          <div className="graph-toolbar__divider" />
          <button
            onClick={() => grapher.setTraceEnabled(!grapher.traceEnabled)}
            className={`graph-tool-btn focus-ring ${
              grapher.traceEnabled ? "graph-tool-btn--active" : ""
            }`}
            title={grapher.traceEnabled ? "Disable trace" : "Enable trace"}
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
