import type { Component } from "solid-js";
import Gallery from "./components/Gallery";
import Preview from "./components/Preview";
import styles from "./App.module.css";

const App: Component = () => {
  return (
    <div class={styles.app_container}>
      {window.webviewType === "gallery" ? <Gallery /> : <Preview />}
    </div>
  );
};

export default App;
