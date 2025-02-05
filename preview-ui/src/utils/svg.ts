export const svgToDataURL = (svg: string) => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
