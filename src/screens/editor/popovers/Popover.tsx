import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const OFFSET = 14;
const MARGIN = 12;

/** Base text size for every popover. */
export const POPOVER_BASE = 16;

/** The band a panel docks within: the editor's body. */
const BOUNDS_ATTR = "[data-popover-bounds]";

export type Anchor = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** The anchor's own corner radius, on-screen, so the scrim's hole traces it. */
  radius: number;
  band: { top: number; bottom: number };
};

const SCRIM_TINT = "rgba(23,60,90,0.42)";

/** Panels that stay lit through the scrim, e.g. the trait checklist read while
    picking. */
const LIT_ATTR = "[data-popover-lit]";

/** By rect, not by node: the panel is portalled and only ever holds the
    anchor's box. */
const inAnchor = (anchor: Anchor, e: PointerEvent) =>
  e.clientX >= anchor.x &&
  e.clientX <= anchor.x + anchor.width &&
  e.clientY >= anchor.y &&
  e.clientY <= anchor.y + anchor.height;

/** Rounded rect as a subpath, so the tint can be clipped around it. */
const holePath = (r: DOMRect, radius: number) => {
  const k = Math.min(radius, r.width / 2, r.height / 2);
  return (
    `M${r.left + k} ${r.top}H${r.right - k}A${k} ${k} 0 0 1 ${r.right} ${r.top + k}` +
    `V${r.bottom - k}A${k} ${k} 0 0 1 ${r.right - k} ${r.bottom}` +
    `H${r.left + k}A${k} ${k} 0 0 1 ${r.left} ${r.bottom - k}` +
    `V${r.top + k}A${k} ${k} 0 0 1 ${r.left + k} ${r.top}Z`
  );
};

/** The clicked element's viewport box, which the panel positions off. */
export const anchorOf = (el: Element): Anchor => {
  const { x, y, width, height } = el.getBoundingClientRect();
  const bounds = el.closest(BOUNDS_ATTR)?.getBoundingClientRect();
  // The rect is on-screen px, the radius is design px; the ratio of the two
  // widths is the zoom between them.
  const layoutWidth = (el as HTMLElement).offsetWidth || width;
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  return {
    x,
    y,
    width,
    height,
    radius: (radius * width) / layoutWidth,
    band: bounds
      ? { top: bounds.top, bottom: bounds.bottom }
      : { top: 0, bottom: innerHeight },
  };
};

/** Panel docked beside its anchor and portalled to the body. */
export function Popover({
  anchor,
  width,
  label,
  liveAnchor = false,
  onClose,
  children,
}: {
  anchor: Anchor;
  width: number;
  label: string;
  /** The anchored section keeps taking clicks while the panel is up: it is the
      surface being edited, not the button that opened it. */
  liveAnchor?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Measured before paint, so the panel doesn't pop on open.
  useLayoutEffect(() => {
    setHeight(panelRef.current?.offsetHeight ?? 0);
  }, [children]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      if (liveAnchor && inAnchor(anchor, e)) return;
      onClose();
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown, true);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown, true);
    };
  }, [onClose, anchor, liveAnchor]);

  const fitsLeft = anchor.x - OFFSET - width >= MARGIN;
  const left = fitsLeft
    ? anchor.x - OFFSET - width
    : Math.min(anchor.x + anchor.width + OFFSET, innerWidth - width - MARGIN);
  // The viewport is the hard limit when the panel is taller than the band holds.
  const bandTop = Math.max(anchor.band.top, MARGIN);
  const bandBottom = Math.min(anchor.band.bottom, innerHeight - MARGIN);
  const top = Math.min(
    Math.max(anchor.y, bandTop),
    Math.max(bandTop, bandBottom - height),
  );

  return createPortal(
    <>
      <Scrim anchor={anchor} liveAnchor={liveAnchor} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-label={label}
        className="border-line text-ui fixed z-50 rounded-[10px] border bg-white/97 p-[0.9em] font-sans shadow-[0_12px_40px_rgba(23,60,90,0.35)] backdrop-blur-sm"
        style={{ left, top, width, fontSize: POPOVER_BASE }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

/** Modal dim */
function Scrim({
  anchor,
  liveAnchor,
}: {
  anchor: Anchor;
  liveAnchor: boolean;
}) {
  // Measured once on open: the panel mounts fresh each time, and nothing under
  // the scrim moves while it is up.
  const [clip] = useState(() => {
    const sheet = `M0 0H${innerWidth}V${innerHeight}H0Z`;
    const anchorHole = holePath(
      new DOMRect(anchor.x, anchor.y, anchor.width, anchor.height),
      anchor.radius,
    );
    const litHoles = [...document.querySelectorAll(LIT_ATTR)]
      .map((el) => holePath(el.getBoundingClientRect(), 10))
      .join("");
    return {
      // Undimmed: the anchor and every lit panel.
      tint: `path(evenodd, "${sheet}${anchorHole}${litHoles}")`,
      // Clickable scrim to close escape the dim.
      catcher: `path(evenodd, "${sheet}${liveAnchor ? anchorHole : ""}${litHoles}")`,
    };
  });

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{ background: SCRIM_TINT, clipPath: clip.tint }}
      />
      <div className="fixed inset-0 z-40" style={{ clipPath: clip.catcher }} />
    </>
  );
}

/** Popover section label, small and quiet: the panels are dense. */
export function PopoverHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-dim mb-1.5 text-[0.85em] font-bold tracking-[0.09em] uppercase">
      {children}
    </h4>
  );
}
