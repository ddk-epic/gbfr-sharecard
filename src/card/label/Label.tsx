import { createContext, useContext, useId, type ReactNode } from "react";

const FAMILY = "'GBFR UI Medium'";

/** Default keyline widths, x a part's own cap. */
export const KEYLINE = { outer: 0.17, inner: 0.01 };

/** Namespaces a def's id to one label; `url(#name)` resolves document-wide,
    not per svg, so every id needs this. */
export type SvgId = (name: string) => string;

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
 * One SVG <text> assembled from ordered Parts, rendered once per mode:
 * "defs" emits each Part's gradient, "fill" its tspan, "inner" the same tspan
 * unfilled for the inner keyline. The inner pass needs its own <text> - SVG
 * takes one stroke per element.
 *
 * A Part runs three times and must be pure. The Label renders once, so it
 * holds the useId every gradient id hangs off and two never collide.
 */
export function Label({
  x = 0,
  baseline = 0,
  outerKeyline = KEYLINE.outer,
  innerKeyline = KEYLINE.inner,
  textAnchor = "start",
  children,
}: {
  x?: number | string;
  /** The text's line, user space. A surface that measures a box around its own
      text leaves this at the origin; one pinned to a fixed canvas sets it. */
  baseline?: number;
  /** Keyline widths, x each part's own cap. */
  outerKeyline?: number;
  innerKeyline?: number;
  textAnchor?: "start" | "end" | "middle";
  children: ReactNode;
}) {
  const uid = useId();
  // url(#name) resolves document-wide, not per svg, so every id is namespaced.
  const id: SvgId = (name) => `${uid}-${name}`;
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
      </defs>
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
    </>
  );
}
