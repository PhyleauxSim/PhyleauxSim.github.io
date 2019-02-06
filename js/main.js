const popSizeSlider = new Slider("#ex8", {
  tooltip: "always"
});
const sampleSizeSlider = new Slider("#ex9", {
  tooltip: "always"
});
const numGenSlider = new Slider("#ex10", {
  tooltip: "always"
});
popSizeSlider.on("change", event => {
  drawCoalescentTree();
});
sampleSizeSlider.on("change", event => {
  drawCoalescentTree();
});
numGenSlider.on("change", event => {
  drawCoalescentTree();
});
function drawCoalescentTree() {
  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  const svgHeight = 0.9 * window.innerHeight;
  const padding = 10;

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  let history = new coalescentHistory(popSize, nGens, sampleSize);

  history.sampleHistory();

  history.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
}
