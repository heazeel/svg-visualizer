// @ts-nocheck

import type { Component } from "solid-js";
import "@vscode-elements/elements/dist/vscode-button/index.js";
import vscode from "./utils/vscode";
import styles from "./App.module.css";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <vscode-button
          onClick={() => {
            vscode.postMessage({
              type: "preview-msg",
              content: { text: "Hello" },
            });
          }}
        >
          你好
        </vscode-button>
      </header>
    </div>
  );
};

export default App;
