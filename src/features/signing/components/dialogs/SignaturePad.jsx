import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Draw-your-signature canvas (mouse, pen, touch). Calls onChange with a PNG
 * data URL after each stroke, or null when cleared. Strokes are smoothed with
 * quadratic curves; the canvas is drawn at device pixel ratio for crisp lines.
 */
export function SignaturePad({
  onChange,
  label = "Draw your signature",
  heightClass = "h-44",
}) {
  const canvasRef = useRef(null);
  const drawing = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const context = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle =
      getComputedStyle(canvas).getPropertyValue("--color-primary").trim() ||
      "#233d8c";
    return ctx;
  }, []);

  // Size the bitmap to the element (and keep it sized on resize).
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
      setIsEmpty(true);
      onChange(null);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
    // onChange is stable enough for a reset-on-resize; avoid redrawing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (event) => {
    const box = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const handleDown = (event) => {
    event.preventDefault();
    canvasRef.current.setPointerCapture(event.pointerId);
    const p = point(event);
    drawing.current = { last: p, mid: p };
    const ctx = context();
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  const handleMove = (event) => {
    if (!drawing.current) return;
    const p = point(event);
    const { last, mid } = drawing.current;
    const nextMid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
    const ctx = context();
    ctx.beginPath();
    ctx.moveTo(mid.x, mid.y);
    ctx.quadraticCurveTo(last.x, last.y, nextMid.x, nextMid.y);
    ctx.stroke();
    drawing.current = { last: p, mid: nextMid };
  };

  const handleUp = () => {
    if (!drawing.current) return;
    drawing.current = null;
    setIsEmpty(false);
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative ${heightClass} rounded-sm border border-line-strong bg-surface`}
      >
        <canvas
          ref={canvasRef}
          aria-label={label}
          role="img"
          className="absolute inset-0 size-full cursor-crosshair touch-none"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        />
        <span
          className="pointer-events-none absolute inset-x-6 bottom-9 border-b border-dashed border-line-strong"
          aria-hidden
        />
        {isEmpty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[15px] text-ink-subtle">
            {label}
          </span>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          icon={Eraser}
          onClick={clear}
          disabled={isEmpty}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
