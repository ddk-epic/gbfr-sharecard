import { useEffect, useState, type ReactNode } from "react";

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/** The larger axis ratio, so stage always covers the viewport. */
const coverScale = () =>
  Math.max(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);

/** Published as `--stage-clip-x/y` so chrome can inset onto the viewport edge. */
const geometry = () => {
  const scale = coverScale();
  return {
    scale,
    clipX: Math.max(0, (STAGE_WIDTH - window.innerWidth / scale) / 2),
    clipY: Math.max(0, (STAGE_HEIGHT - window.innerHeight / scale) / 2),
  };
};

/** The fixed stage, fitted to the viewport by the wrapper transform only. */
export function Stage({ children }: { children: ReactNode }) {
  const [{ scale, clipX, clipY }, setGeometry] = useState(geometry);

  useEffect(() => {
    const onResize = () => setGeometry(geometry());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative h-dvh overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 h-[1080px] w-[1920px] origin-center"
        style={
          {
            transform: `translate(-50%, -50%) scale(${scale})`,
            "--stage-clip-x": `${clipX}px`,
            "--stage-clip-y": `${clipY}px`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
