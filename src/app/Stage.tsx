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
    <div className="relative h-dvh overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 h-[1080px] w-[1920px] origin-center"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
