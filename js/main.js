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
    drawNewHistory();
    drawCoalescentTree(sort);
  })
}

var hs = null;

function drawNewHistory(){

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  hs = new CoalescentHistory(popSize, nGens, sampleSize);
  
  hs.sampleHistory();

}

function drawCoalescentTree(sort=false) {

  function clear(){
    d3.selectAll('svg').remove()
  }

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  const svgHeight = 40 * nGens;           // Height scales with # of generations
  const padding = 10;

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  clear()

  // let history = new coalescentHistory(popSize, nGens, sampleSize);

  // history.sampleHistory();
  
  sort ? hs.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization")  : hs.drawHistory(svgWidth, svgHeight, padding, "#visualization");

  const v = new Vivus('vis', {type: 'oneByOne', start: 'autostart', duration: 200, animTimingFunction: Vivus.EASE}); 
}

function drawFullHistory() {

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;   // Constant height
  const svgHeight = 40 * nGens;           // Height scales with # of generations
  const padding = 10;

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  hFull = new CoalescentHistory(popSize, nGens, sampleSize);

  hFull.sampleHistory();

  hFull.drawFullPopHistory(svgWidth, svgHeight, padding, "#visualization");

}