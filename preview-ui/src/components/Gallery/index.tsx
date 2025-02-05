import { createSignal } from "solid-js";
import type { Component } from "solid-js";
import vscode from "@/utils/vscode";
import styles from "./index.module.css";
import { SvgCode } from "@/types";
import { svgToDataURL } from "@/utils/svg";

const Gallery: Component = () => {
  const [selected, setSelected] = createSignal("");

  const getSvgId = (item: SvgCode) =>
    `${item.path.realPath.replace(item.path.rootPath, "")}:${
      item.range.start.line
    }-${item.range.end.line}`;

  return (
    <div class={styles.container}>
      {window.svgCodes.map((item) => (
        <div
          innerHTML={item.code}
          class={`${styles.item_container} ${
            selected() === getSvgId(item) ? styles.selected : ""
          }`}
          draggable={false}
          title={getSvgId(item)}
          onClick={() => {
            vscode.postMessage({
              type: "gallery",
              payload: {
                method: "openCode",
                params: { path: item.path.realPath, range: item.range },
              },
            });
            setSelected(getSvgId(item));
          }}
        />
      ))}
    </div>
  );
};

export default Gallery;
