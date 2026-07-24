import { useEffect, useState, type ReactNode } from "react";

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/** Breathing room so the stage never touches the viewport edge. */
const STAGE_MARGIN_PX = 20;

const fitScale = () =>
  Math.min(1, (window.innerWidth - STAGE_MARGIN_PX) / STAGE_WIDTH);

/**
 * The fixed stage, fitted to the viewport by wrapper transform only. Nothing
 * inside is ever scaled itself - the PNG export depends on that.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(fitScale);

  useEffect(() => {
    const onResize = () => setScale(fitScale());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);

  return (
    // The wrapper reserves the scaled layout height; #stage keeps its full
    // size and carries only the visual transform.
    <div style={{ height: `${STAGE_HEIGHT * scale}px`, overflow: "hidden" }}>
      <div id="stage" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
