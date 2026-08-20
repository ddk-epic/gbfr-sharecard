import { Fragment } from "react";

const CREDITS = [
  {
    label: "nenkai.github.io",
    href: "https://nenkai.github.io/relink-modding/resources/",
  },
];

const REPO = "https://github.com/ddk-epic/gbfr-sharecard";

const Dot = () => <span className="text-line">·</span>;

const Link = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-deep-4 no-underline hover:underline"
  >
    {label}
  </a>
);

export function CardFooter() {
  return (
    <div className="border-line/80 text-dim absolute right-0 bottom-(--stage-clip-y) left-0 z-2 flex h-13 items-center justify-center gap-2.25 border-t bg-white/75 text-[12.5px] backdrop-blur-[3px]">
      <span>gbfr-sharecard</span>
      <Dot />
      <span>fan project - Granblue Fantasy: Relink © Cygames</span>
      <Dot />
      <span>credits:</span>
      {CREDITS.map((credit, i) => (
        <Fragment key={credit.href}>
          {i > 0 && <Dot />}
          <Link {...credit} />
        </Fragment>
      ))}
      <Dot />
      <Link href={REPO} label="GitHub" />
    </div>
  );
}
