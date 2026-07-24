import { domToBlob } from "modern-screenshot";

const CARD_WIDTH = 1920;
const CARD_HEIGHT = 1080;

const cardToBlob = async (node: HTMLElement): Promise<Blob> => {
  await document.fonts.ready; // fonts must resolve before capture
  return domToBlob(node, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    scale: 1, // pixel ratio pinned; the node is already full size
  });
};

export const canCopy = () =>
  typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write;

/**
 * The ClipboardItem is constructed synchronously in the click handler with a
 * Promise<Blob> value - the one pattern that satisfies Safari's transient
 * activation rule and works in Chrome/Edge/Firefox 127+/Safari 13.1+.
 */
export function copyCard(node: HTMLElement): Promise<void> {
  const blobPromise = cardToBlob(node);
  return navigator.clipboard.write([
    new ClipboardItem({ "image/png": blobPromise }),
  ]);
}

export async function downloadCard(
  node: HTMLElement,
  characterId: string,
): Promise<void> {
  const blob = await cardToBlob(node);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gbfr-${characterId}-build.png`;
  link.click();
  // Firefox cancels the download if the URL dies before the fetch starts.
  setTimeout(() => URL.revokeObjectURL(url));
}
