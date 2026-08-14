import { Fragment, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, Copy, Download, Maximize2 } from "lucide-react";
import type { Build } from "../domain/build";
import { Card, CARD_HEIGHT, CARD_WIDTH } from "./card/Card";
import { CardModal } from "./card/CardModal";
import { canCopy, copyCard, downloadCard } from "./card/export";
import { BackButton, Cta, Heading, Panel } from "../components/ui";

const ICON = 16;
const COPY_IDLE = (
  <>
    <Copy size={ICON} aria-hidden />
    Copy PNG
  </>
);
const DOWNLOAD_IDLE = (
  <>
    <Download size={ICON} aria-hidden />
    Download
  </>
);
const done = (text: string) => (
  <>
    <Check size={ICON} aria-hidden />
    {text}
  </>
);
const FLASH_MS = 900;

/** Fixed preview-box width; the card's aspect sets the height and the scale. */
const PREVIEW_WIDTH = 1190.4;
const PREVIEW_SCALE = PREVIEW_WIDTH / CARD_WIDTH;

const CREDITS = [
  {
    label: "PE Patch Tool",
    href: "https://github.com/BitterG/GBFR-PE-Patch-Tool",
  },
  {
    label: "calculator sheet",
    href: "https://docs.google.com/spreadsheets/d/1RnNLfdqFCW7zWvfHnQsNRJoi7EtIjdOUg-uYB0xsZHQ",
  },
  {
    label: "summon datamine",
    href: "https://nenkai.github.io/relink-modding/resources/summon_trait_chances/",
  },
  { label: "relink.gbf.wiki", href: "https://relink.gbf.wiki" },
];

export function CardScreen({
  build,
  onBack,
}: {
  build: Build;
  onBack: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copyLabel, setCopyLabel] = useState<ReactNode>(COPY_IDLE);
  const [downloadLabel, setDownloadLabel] = useState<ReactNode>(DOWNLOAD_IDLE);
  const [zoomed, setZoomed] = useState(false);

  // Locking the measured width keeps the longer done-state from shifting layout.
  const flashLabel = (
    setLabel: (n: ReactNode) => void,
    idle: ReactNode,
    flash: ReactNode,
    button: HTMLButtonElement,
  ) => {
    button.style.minWidth = `${button.offsetWidth}px`;
    setLabel(flash);
    setTimeout(() => setLabel(idle), FLASH_MS);
  };

  const onCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const node = cardRef.current!;
    const fallToDownload = () => {
      void downloadCard(node, build.characterId);
      flashLabel(setCopyLabel, COPY_IDLE, "couldn't copy - downloaded", button);
    };
    if (!canCopy()) return fallToDownload();
    copyCard(node)
      .then(() => flashLabel(setCopyLabel, COPY_IDLE, done("Copied"), button))
      .catch(fallToDownload);
  };

  const onDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    void downloadCard(cardRef.current!, build.characterId).then(() =>
      flashLabel(setDownloadLabel, DOWNLOAD_IDLE, done("Saved"), button),
    );
  };

  return (
    <>
      <BackButton onClick={onBack}>
        <ChevronLeft size={ICON} aria-hidden />
        Editor
      </BackButton>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-13">
        <Panel pad="sm">
          <div className="flex items-center gap-2.5">
            <Heading>Share Card</Heading>
            <span className="text-dim ml-auto text-[12.5px]">
              PNG · {CARD_WIDTH}×{CARD_HEIGHT}
            </span>
            <Cta sm onClick={onCopy}>
              {copyLabel}
            </Cta>
            <Cta sm variant="secondary" onClick={onDownload}>
              {downloadLabel}
            </Cta>
          </div>
          {/* Preview scales the full-size node down; click opens the 1:1 inspector. */}
          <div
            className="group relative cursor-zoom-in overflow-hidden rounded-lg shadow-[0_4px_24px_rgba(23,60,90,0.25)]"
            style={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_WIDTH * (CARD_HEIGHT / CARD_WIDTH),
            }}
            onClick={() => setZoomed(true)}
            title="View at full resolution"
          >
            <div
              className="origin-top-left"
              style={{ transform: `scale(${PREVIEW_SCALE})` }}
            >
              <div ref={cardRef}>
                <Card build={build} />
              </div>
            </div>
            <span className="pointer-events-none absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Maximize2 size={13} aria-hidden />
              Full resolution
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-dim text-[12.5px]">
              read-only - jump back up to keep editing
            </span>
          </div>
        </Panel>
      </div>
      <div className="border-line/80 text-dim absolute right-0 bottom-0 left-0 z-2 flex h-13 items-center justify-center gap-2.25 border-t bg-white/40 text-[12.5px] backdrop-blur-[3px]">
        <span>gbfr-sharecard</span>
        <span className="text-line">·</span>
        <span>fan project - Granblue Fantasy: Relink © Cygames</span>
        <span className="text-line">·</span>
        <span>data:</span>
        {CREDITS.map((credit, i) => (
          <Fragment key={credit.href}>
            {i > 0 && <span className="text-line">·</span>}
            <a
              href={credit.href}
              target="_blank"
              rel="noreferrer"
              className="text-deep-4 no-underline hover:underline"
            >
              {credit.label}
            </a>
          </Fragment>
        ))}
        <span className="text-line">·</span>
        <a
          href="https://github.com/ddk-epic/gbfr-sharecard"
          target="_blank"
          rel="noreferrer"
          className="text-deep-4 no-underline hover:underline"
        >
          GitHub
        </a>
      </div>
      {zoomed && <CardModal build={build} onClose={() => setZoomed(false)} />}
    </>
  );
}
