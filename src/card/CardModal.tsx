import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, Scan, X } from "lucide-react";
import type { Build } from "../domain/build";
import { Card, CARD_HEIGHT, CARD_WIDTH } from "./Card";

/* Full-resolution inspector. Zooms out only - 100% is the ceiling, no
   upscaling; the floor fits the whole card in the viewport. Wheel zooms toward
   the cursor, drag pans. */

const MAX_ZOOM = 1;
const START_ZOOM = 0.66; // initial zoom
const WHEEL_STEP = 0.0015; // per wheel delta unit
const BUTTON_STEP = 1.25; // multiplier per +/- click
const DRAG_SLOP = 5; // px of movement that turns a click into a drag

/** Keep the card within the viewport; centre the axis smaller than it. */
function clampPan(x: number, y: number, zoom: number, vw: number, vh: number) {
  const sw = CARD_WIDTH * zoom;
  const sh = CARD_HEIGHT * zoom;
  const cx = sw <= vw ? (vw - sw) / 2 : Math.min(0, Math.max(vw - sw, x));
  const cy = sh <= vh ? (vh - sh) / 2 : Math.min(0, Math.max(vh - sh, y));
  return { x: cx, y: cy };
}

/** Pan that centres the card in the viewport at any zoom. */
function centrePan(zoom: number, vw: number, vh: number) {
  return { x: (vw - CARD_WIDTH * zoom) / 2, y: (vh - CARD_HEIGHT * zoom) / 2 };
}

export function CardModal({
  build,
  onClose,
}: {
  build: Build;
  onClose: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const [minZoom, setMinZoom] = useState(0.4);
  const [zoom, setZoom] = useState(START_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Viewport box and zoom mirrored in refs so handlers read the latest without
  // re-subscribing.
  const sizeRef = useRef({ w: 0, h: 0 });
  const zoomRef = useRef(START_ZOOM);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const clamp = useCallback(
    (z: number) => Math.min(MAX_ZOOM, Math.max(minZoom, z)),
    [minZoom],
  );

  /** Re-measure viewport and fit floor on resize; keep the card in bounds. */
  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    sizeRef.current = { w, h };
    const floor = Math.min(w / CARD_WIDTH, h / CARD_HEIGHT);
    setMinZoom(floor);
    const nextZoom = Math.min(MAX_ZOOM, Math.max(floor, zoomRef.current));
    setZoom(nextZoom);
    setPan((p) => clampPan(p.x, p.y, nextZoom, w, h));
  }, []);

  // Measure before first paint so the card never flashes mis-centred.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    sizeRef.current = { w, h };
    const floor = Math.min(w / CARD_WIDTH, h / CARD_HEIGHT);
    setMinZoom(floor);
    // Open at START_ZOOM, never below the fit floor, centred.
    const start = Math.min(MAX_ZOOM, Math.max(floor, START_ZOOM));
    setZoom(start);
    setPan(centrePan(start, w, h));
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  // Esc closes; lock the page behind the modal from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomBy(BUTTON_STEP);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / BUTTON_STEP);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  /** Zoom about the viewport centre by a multiplier. */
  const zoomBy = (factor: number) => {
    const { w, h } = sizeRef.current;
    setZoom((z) => {
      const next = clamp(z * factor);
      setPan((p) => {
        // Keep the viewport centre fixed as the scale changes.
        const cx = w / 2;
        const cy = h / 2;
        const nx = cx - ((cx - p.x) / z) * next;
        const ny = cy - ((cy - p.y) / z) * next;
        return clampPan(nx, ny, next, w, h);
      });
      return next;
    });
  };

  const reset = () => {
    const { w, h } = sizeRef.current;
    setZoom(MAX_ZOOM);
    setPan(centrePan(MAX_ZOOM, w, h));
  };

  const fit = () => {
    const { w, h } = sizeRef.current;
    setZoom(minZoom);
    setPan(centrePan(minZoom, w, h));
  };

  // Wheel zoom anchored to the cursor: the point under the pointer stays put.
  const onWheel = (e: React.WheelEvent) => {
    const { w, h } = sizeRef.current;
    const rect = viewportRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setZoom((z) => {
      const next = clamp(z * Math.exp(-e.deltaY * WHEEL_STEP));
      setPan((p) => {
        const nx = px - ((px - p.x) / z) * next;
        const ny = py - ((py - p.y) / z) * next;
        return clampPan(nx, ny, next, w, h);
      });
      return next;
    });
  };

  // Drag to pan; a barely-moved pointer counts as a backdrop click and closes.
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
    d.moved = true;
    d.x = e.clientX;
    d.y = e.clientY;
    const { w, h } = sizeRef.current;
    setPan((p) => clampPan(p.x + dx, p.y + dy, zoom, w, h));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    // A genuine click: close only if it landed outside the card.
    if (!cardWrapRef.current?.contains(e.target as Node)) onClose();
  };

  const pct = Math.round(zoom * 100);

  // Portal to body: the screen track's translateY transform would otherwise be
  // the containing block for `fixed`, not the viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 bg-[#04121c]/92 backdrop-blur-sm">
      <div
        ref={viewportRef}
        className="absolute inset-0 touch-none overflow-hidden"
        style={{ cursor: drag.current?.moved ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          ref={cardWrapRef}
          className="origin-top-left"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <Card build={build} />
        </div>
      </div>

      <div
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-1.5 py-1 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md select-none"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <HudBtn
          onClick={() => zoomBy(1 / BUTTON_STEP)}
          disabled={pct <= Math.round(minZoom * 100)}
          title="Zoom out"
        >
          <Minus size={18} />
        </HudBtn>
        <span className="w-14 text-center text-sm font-semibold tabular-nums">
          {pct}%
        </span>
        <HudBtn
          onClick={() => zoomBy(BUTTON_STEP)}
          disabled={pct >= 100}
          title="Zoom in"
        >
          <Plus size={18} />
        </HudBtn>
        <span className="mx-0.5 h-5 w-px bg-white/20" />
        <HudBtn onClick={fit} title="Fit to screen">
          <Scan size={18} />
        </HudBtn>
        <button
          onClick={reset}
          className="rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide hover:bg-white/15"
          title="Actual size"
        >
          1:1
        </button>
      </div>

      <button
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
        title="Close (Esc)"
        className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-md hover:bg-black/70"
      >
        <X size={20} />
      </button>
    </div>,
    document.body,
  );
}

function HudBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}
