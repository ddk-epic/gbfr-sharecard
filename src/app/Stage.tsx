import { useEffect, useState, type ReactNode } from "react";

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/**
 * Cover scale, the background-size: cover rule in numbers - the larger of the
 * two axis ratios, so the stage always spans the whole viewport and no shell
 * edge is ever visible. Whichever axis overflows is clipped evenly, and the
 * screens keep their content inside that safe middle band.
 */
const coverScale = () =>
  Math.max(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);

/**
 * The fixed stage, fitted to the viewport by wrapper transform only. Nothing
 * inside is ever scaled itself - the PNG export depends on that.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(coverScale);

  useEffect(() => {
    const onResize = () => setScale(coverScale());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);

  return (
    // The wrapper fills the viewport and clips; #stage keeps its full size and
    // carries only the visual transform, centred on the wrapper.
    <div style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
      <div
        id="stage"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transformOrigin: "center",
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
