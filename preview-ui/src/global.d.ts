import { SvgCode } from "./types";

declare global {
  interface Window {
    webviewType: "gallery" | "preview";
    svgCodes: SvgCode[];
  }
}
