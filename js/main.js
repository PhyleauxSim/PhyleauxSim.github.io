const popSizeSlider = new Slider("#population-size", {
  tooltip: "always"
});
const sampleSizeSlider = new Slider("#sample-size", {
  tooltip: "always"
});
const numGenSlider = new Slider("#number-of-generations", {
  tooltip: "always"
});

const sliders = [sampleSizeSlider, popSizeSlider, numGenSlider];

for(let i = 0; i < sliders.length; i++){
  sliders[i].on('change', function(event){
    drawCoalescentTree();
  })
}

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

   const v = new Vivus('vis', {type: 'oneByOne', start: 'autostart', animTimingFunction: Vivus.EASE})
}