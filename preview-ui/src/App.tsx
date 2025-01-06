import type { Component } from "solid-js";
import vscode from "./utils/vscode";
import styles from "./App.module.css";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <div class={styles.container}>
        {/* @ts-ignore */}
        {window.svgCodes.map((item: any) => (
          <div
            onClick={() => {
              vscode.postMessage({
                type: "gallery",
                payload: {
                  method: "openCode",
                  params: { path: item.path, range: item.range },
                },
              });
            }}
            class={styles.item_container}
            innerHTML={item.code}
          />
          // <div class={styles.item_container}>
          //   <img
          //     alt=""
          //     src={`data:image/svg+xml,${encodeURIComponent(item.code)}`}
          //   />
          // </div>
        ))}
      </div>
    </div>
  );
};

export default App;
