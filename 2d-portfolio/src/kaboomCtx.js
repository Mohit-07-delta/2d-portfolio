import kaplay from "kaplay";

export const scaleFactor = 4;

export const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: false, // set to true for debugging bounding boxes if needed
});
