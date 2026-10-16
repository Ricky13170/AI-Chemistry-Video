// SVG <use> needs a same-origin resource; data URLs are restricted by browsers.
import sprite from "./icons.svg?no-inline";

export type IconName =
    | "flask"
    | "grid"
    | "history"
    | "user"
    | "login"
    | "arrow"
    | "search"
    | "play"
    | "pause"
    | "video"
    | "slides"
    | "file"
    | "spark"
    | "check"
    | "mic"
    | "volume"
    | "mute"
    | "expand"
    | "download"
    | "help"
    | "close"
    | "menu"
    | "reset"
    | "book"
    | "layers"
    | "bulb";

export function Icon({
    name,
    small = false,
    className = "",
}: {
    name: IconName;
    small?: boolean;
    className?: string;
}) {
    return (
        <svg
            className={`icon ${small ? "sm" : ""} ${className}`}
            aria-hidden="true"
        >
            <use href={`${sprite}#i-${name}`} />
        </svg>
    );
}
