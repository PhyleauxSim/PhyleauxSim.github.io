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
  sliders[i].on('slideStop', function(event){
    drawCoalescentTree();
  })
}

var h = null;

function drawCoalescentTree() {

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;		// Constant height
  const svgHeight = 40 * nGens;						// Height scales with # of generations
  const padding = 10;

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  h = new coalescentHistory(popSize, nGens, sampleSize);

  h.sampleHistory();

  h.drawHistory(svgWidth, svgHeight, padding, "#visualization");

  // h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");

  const v = new Vivus('vis', {type: 'oneByOne', start: 'autostart', duration: 200, animTimingFunction: Vivus.EASE});
  
}

function redrawSortedHistory() {

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();
  
  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;		// Constant height
  const svgHeight = 40 * nGens;						// Height scales with # of generations
  const padding = 10;

  d3.selectAll("svg").remove();

  h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
  
}

function drawAndSortHistory() {

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;		// Constant height
  const svgHeight = 40 * nGens;						// Height scales with # of generations
  const padding = 10;

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  h = new coalescentHistory(popSize, nGens, sampleSize);

  h.sampleHistory();

  h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");

}

