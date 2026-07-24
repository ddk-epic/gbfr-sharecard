import { Fragment, useRef, useState } from "react";
import type { Build } from "../domain/build";
import { Card } from "../card/Card";
import { canCopy, copyCard, downloadCard } from "../card/export";
import "./CardScreen.css";

const COPY_IDLE = "⧉ Copy PNG";
const DOWNLOAD_IDLE = "⬇ Download";
const FLASH_MS = 900;

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
  const [copyLabel, setCopyLabel] = useState(COPY_IDLE);
  const [downloadLabel, setDownloadLabel] = useState(DOWNLOAD_IDLE);

  // Locking the measured width keeps the longer done-state from shifting layout.
  const flashLabel = (
    setLabel: (s: string) => void,
    idle: string,
    done: string,
    button: HTMLButtonElement,
  ) => {
    button.style.minWidth = `${button.offsetWidth}px`;
    setLabel(done);
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
      .then(() => flashLabel(setCopyLabel, COPY_IDLE, "Copied ✓", button))
      .catch(fallToDownload);
  };

  const onDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    void downloadCard(cardRef.current!, build.characterId).then(() =>
      flashLabel(setDownloadLabel, DOWNLOAD_IDLE, "Saved ✓", button),
    );
  };

  return (
    <>
      <button className="back" onClick={onBack}>
        ‹ Editor
      </button>
      <div className="cardWrap">
        <div className="win cardWin">
          <div className="hd">
            <h3>Share Card</h3>
            <span className="meta">PNG · 1920×1080</span>
            <button className="cta" onClick={onCopy}>
              {copyLabel}
            </button>
            <button className="cta sec" onClick={onDownload}>
              {downloadLabel}
            </button>
          </div>
          <div className="frame">
            <div className="cardScale">
              <div ref={cardRef}>
                <Card build={build} />
              </div>
            </div>
          </div>
          <div className="actions">
            <span className="hint">
              read-only - jump back up to keep editing
            </span>
          </div>
        </div>
      </div>
      <div className="foot">
        <span>gbfr-sharecard</span>
        <span className="sep">·</span>
        <span>fan project - Granblue Fantasy: Relink © Cygames</span>
        <span className="sep">·</span>
        <span>data:</span>
        {CREDITS.map((credit, i) => (
          <Fragment key={credit.href}>
            {i > 0 && <span className="sep">·</span>}
            <a href={credit.href} target="_blank" rel="noreferrer">
              {credit.label}
            </a>
          </Fragment>
        ))}
        <span className="sep">·</span>
        <a
          href="https://github.com/ddk-epic/gbfr-sharecard"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </>
  );
}
