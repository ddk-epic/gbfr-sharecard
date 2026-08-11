import { createContext, useContext, type ReactNode } from "react";
import { CAP_RATIO, type SvgId } from "../label-run";

/** Copy of label-run.tsx's private FAMILY. */
const FAMILY = "'GBFR UI Medium'";

const SHADOW = { dy: 0.02, blur: 0.02, opacity: 0.6 };
const SHADOW_COLOR = "var(--deep-8)";

export type PartMode = "defs" | "fill" | "inner";

export type PartContext = {
  mode: PartMode;
  id: SvgId;
  baseline: number;
  /** Outer/inner keyline width as a share of a part's own cap. */
  outerKeyline: number;
  innerKeyline: number;
  /** This part's gradient-id ordinal. "defs" and "fill" must call it equally
      often and in the same order. */
  nextGradId: () => number;
  /** This part's leading `dx`; stashes its trailing tracking for the next
      call. Returns 0 on the first call, so a first part's gap is ignored. */
  leadingDx: (gap: number, cap: number, tracking: number) => number;
};

const LabelPartContext = createContext<PartContext | null>(null);

/** A Part's paint mode and chain position. Throws outside a Label. */
export function usePart(): PartContext {
  const ctx = useContext(LabelPartContext);
  if (!ctx) throw new Error("Label parts must render inside <Label>");
  return ctx;
}

function makePartContext(
  mode: PartMode,
  id: SvgId,
  baseline: number,
  outerKeyline: number,
  innerKeyline: number,
): PartContext {
  let gradCounter = 0;
  let prevTrailing = 0;
  let isFirst = true;
  return {
    mode,
    id,
    baseline,
    outerKeyline,
    innerKeyline,
    nextGradId: () => gradCounter++,
    leadingDx: (gap, cap, tracking) => {
      const dx0 = isFirst ? 0 : gap * cap - prevTrailing;
      isFirst = false;
      prevTrailing = tracking * cap;
      return dx0;
    },
  };
}

/**
 * One SVG <text> assembled from ordered Parts. Renders its children three
 * times, once per context mode:
 *
 * - "defs" - each Part emits its body-fade <linearGradient>.
 * - "fill" - each Part emits a <tspan> taking that gradient and the outer
 *   keyline, centred on the outline (paintOrder="stroke").
 * - "inner" - the same <tspan>, fill="none", stroked for the inner keyline.
 *   Its own <text>, since SVG takes one stroke per element. Rides the same
 *   dx chain and takes no gradient ids.
 *
 * A Part runs once per mode, so it must be pure - no useId, state, effects.
 */
export function Label({
  id,
  x = 0,
  baseline,
  anchorSize,
  outerKeyline,
  innerKeyline,
  textAnchor = "start",
  children,
}: {
  id: SvgId;
  x?: number | string;
  baseline: number;
  /** The largest part's `size`; scales the shadow. Passed in because a
      preset's size is not readable before it renders. */
  anchorSize: number;
  /** Keyline widths, x each part's own cap. */
  outerKeyline: number;
  innerKeyline: number;
  textAnchor?: "start" | "end" | "middle";
  children: ReactNode;
}) {
  const anchorCap = anchorSize * CAP_RATIO;
  const textProps = {
    x,
    y: baseline,
    textAnchor,
    fontFamily: FAMILY,
    style: { fontVariantNumeric: "tabular-nums" as const },
    xmlSpace: "preserve" as const,
  };
  return (
    <>
      <defs>
        <LabelPartContext.Provider
          value={makePartContext(
            "defs",
            id,
            baseline,
            outerKeyline,
            innerKeyline,
          )}
        >
          {children}
        </LabelPartContext.Provider>
        <filter
          id={id("lblshadow")}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          {/* floodColor through style: it is a var(), and export clones
              the DOM. */}
          <feDropShadow
            dx={0}
            dy={SHADOW.dy * anchorCap}
            stdDeviation={SHADOW.blur * anchorCap}
            style={{
              floodColor: SHADOW_COLOR,
              floodOpacity: SHADOW.opacity,
            }}
          />
        </filter>
      </defs>
      {/* One group: the shadow casts once, over the whole assembly. */}
      <g filter={`url(#${id("lblshadow")})`}>
        <text {...textProps} paintOrder="stroke" strokeLinejoin="round">
          <LabelPartContext.Provider
            value={makePartContext(
              "fill",
              id,
              baseline,
              outerKeyline,
              innerKeyline,
            )}
          >
            {children}
          </LabelPartContext.Provider>
        </text>
        <text {...textProps} fill="none" strokeLinejoin="round">
          <LabelPartContext.Provider
            value={makePartContext(
              "inner",
              id,
              baseline,
              outerKeyline,
              innerKeyline,
            )}
          >
            {children}
          </LabelPartContext.Provider>
        </text>
      </g>
    </>
  );
}
