import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/** Gap between the anchor and the panel, and the least clearance to a viewport
    edge. */
const OFFSET = 14;
const MARGIN = 12;

/** Base text size for every popover, px. Popovers render outside
 * the editor's `zoom`, so this is on-screen px as written.
 */
export const POPOVER_BASE = 16;

/** The band, a panel docks within the editor's body. */
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

/** Big enough to reach every viewport edge from any hole position. */
const SCRIM_SPREAD = "100vmax";
const SCRIM_TINT = "rgba(23,60,90,0.42)";

/** The clicked element's viewport box, which is what the panel positions off. */
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

/** Panel docked beside its anchor, portalled to the body so it escapes the
    editor's `zoom` and renders at 1:1. */
export function Popover({
  anchor,
  width,
  label,
  onClose,
  children,
}: {
  anchor: Anchor;
  width: number;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // calculates the layout before render so the panel doesn't pop on open.
  useLayoutEffect(() => {
    setHeight(panelRef.current?.offsetHeight ?? 0);
  }, [children]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown, true);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown, true);
    };
  }, [onClose]);

  const fitsLeft = anchor.x - OFFSET - width >= MARGIN;
  const left = fitsLeft
    ? anchor.x - OFFSET - width
    : Math.min(anchor.x + anchor.width + OFFSET, innerWidth - width - MARGIN);
  // the viewport is the hard limit when the panel is taller than the band can hold.
  const bandTop = Math.max(anchor.band.top, MARGIN);
  const bandBottom = Math.min(anchor.band.bottom, innerHeight - MARGIN);
  const top = Math.min(
    Math.max(anchor.y, bandTop),
    Math.max(bandTop, bandBottom - height),
  );

  return createPortal(
    <>
      <Scrim anchor={anchor} />
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

/** Modal dim with the active section in focus. */
function Scrim({ anchor }: { anchor: Anchor }) {
  return (
    <>
      <div className="fixed inset-0 z-40" />
      <div
        aria-hidden
        className="pointer-events-none fixed z-40"
        style={{
          left: anchor.x,
          top: anchor.y,
          width: anchor.width,
          height: anchor.height,
          borderRadius: anchor.radius,
          boxShadow: `0 0 0 ${SCRIM_SPREAD} ${SCRIM_TINT}`,
        }}
      />
    </>
  );
}

/** Popover section label; the panels are dense, so it stays small and quiet. */
export function PopoverHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-dim mb-1.5 text-[0.85em] font-bold tracking-[0.09em] uppercase">
      {children}
    </h4>
  );
}
