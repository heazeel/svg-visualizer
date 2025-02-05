import { createSignal, onMount } from "solid-js";
import type { Component } from "solid-js";
import styles from "./index.module.css";
import { svgToDataURL } from "@/utils/svg";

const Preview: Component = () => {
  const [scale, setScale] = createSignal(1);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [startPosition, setStartPosition] = createSignal({ x: 0, y: 0 });

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const newScale = scale() + event.deltaY * -0.1;
      setScale(Math.max(newScale, 1));
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: event.clientX - position().x,
      y: event.clientY - position().y,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging()) {
      setPosition({
        x: event.clientX - startPosition().x,
        y: event.clientY - startPosition().y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  onMount(() => {
    const containerElement = document.querySelector(`.${styles.container}`);
    const svgElement = document.querySelector("svg");
    if (containerElement && svgElement) {
      const containerWidth = containerElement.clientWidth;
      svgElement.addEventListener("load", () => {
        const { width } = svgElement.getBoundingClientRect();
        setScale((containerWidth * 0.8) / width);
      });
    }
  });

  return (
    <div
      class={styles.container}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {window.svgCodes.map((item: any) => (
        <div
          innerHTML={item.code}
          draggable={false}
          class={styles.item_container}
          style={{
            transform: `translate(${position().x}px, ${
              position().y
            }px) scale(${scale()})`,
            cursor: isDragging() ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        />
        // <img
        //   draggable={false}
        //   src={svgToDataURL(item.code)}
        //   class={styles.item_container}
        //   style={{
        //     transform: `translate(${position().x}px, ${
        //       position().y
        //     }px) scale(${scale()})`,
        //     cursor: isDragging() ? "grabbing" : "grab",
        //   }}
        //   onMouseDown={handleMouseDown}
        // />
      ))}
      <div class={styles.scale_indicator}>
        <div class={styles.scale_btn} onClick={() => setScale(scale() * 2)}>
          +
        </div>
        <div>{Math.round(scale() * 100)}%</div>
        <div
          class={styles.scale_btn}
          onClick={() => setScale(Math.max(scale() / 2, 1))}
        >
          -
        </div>
      </div>
    </div>
  );
};

export default Preview;
