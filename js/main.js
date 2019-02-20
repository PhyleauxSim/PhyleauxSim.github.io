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

<<<<<<< HEAD

function drawCoalescentTree(sort=false) {

  function clear(){
    d3.selectAll('svg').remove()
  }

  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

||||||| merged common ancestors
function drawCoalescentTree() {
=======
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
  
>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418
  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
<<<<<<< HEAD
  const svgHeight = 40 * nGens;           // Height scales with # of generations
||||||| merged common ancestors
  const svgHeight = 0.9 * window.innerHeight;
=======
  //const svgHeight = 0.9 * window.innerHeight;		// Constant height
  const svgHeight = 40 * nGens;						// Height scales with # of generations
>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418
  const padding = 10;

<<<<<<< HEAD
  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  clear()

  let history = new coalescentHistory(popSize, nGens, sampleSize);

  history.sampleHistory();
  sort ? history.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization")  : history.drawHistory(svgWidth, svgHeight, padding, "#visualization")

  const v = new Vivus('vis', {type: 'oneByOne', start: 'autostart', duration: 200, animTimingFunction: Vivus.EASE});
  
}


function drawAndSortHistory() {

||||||| merged common ancestors
=======
  d3.selectAll("svg").remove();

  h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
  
}

function drawAndSortHistory() {

>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418
  const popSize = popSizeSlider.getValue();
  const sampleSize = sampleSizeSlider.getValue();
  const nGens = numGenSlider.getValue();

<<<<<<< HEAD
  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;   // Constant height
  const svgHeight = 40 * nGens;           // Height scales with # of generations
  const padding = 10;

||||||| merged common ancestors
=======
  // Setting plotting defaults
  const svgWidth = 0.57 * window.innerWidth;
  //const svgHeight = 0.9 * window.innerHeight;		// Constant height
  const svgHeight = 40 * nGens;						// Height scales with # of generations
  const padding = 10;

>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418
  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  h = new coalescentHistory(popSize, nGens, sampleSize);

  h.sampleHistory();

<<<<<<< HEAD
  h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
||||||| merged common ancestors
  history.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
=======
  h.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");

}
>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418

<<<<<<< HEAD
}
||||||| merged common ancestors
   const v = new Vivus('vis', {type: 'oneByOne', start: 'autostart', animTimingFunction: Vivus.EASE})
}
=======
>>>>>>> 34d07f5461ce3cecd296a11ad4c574c3feda8418
