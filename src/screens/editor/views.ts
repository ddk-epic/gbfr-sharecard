/** The editor's panes, in tab and flip order. Also the URL's editor views. */
export const EDITOR_VIEWS = ["skills", "gear", "mt"] as const;

export type EditorView = (typeof EDITOR_VIEWS)[number];
