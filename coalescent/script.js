function drawCoalescentTree() {
  // Setting plotting defaults
  var svgWidth = 0.45 * window.innerWidth;
  var svgHeight = 0.85 * window.innerHeight;
  var padding = 15;

  const popSize = parseInt(document.getElementById("popSize").value);
  const nGens = parseInt(document.getElementById("numGenerations").value);
  const sampleSize = parseInt(document.getElementById("sampleSize").value);

  if (sampleSize > popSize) {
    alert("Sample size cannot be greater than the population size.");
    return;
  }

  d3.selectAll("svg").remove();

  var history = new coalescentHistory(popSize, nGens, sampleSize);

  history.sampleHistory();

  history.drawSortedHistory(svgWidth, svgHeight, padding, "#visualization");
}

window.onload = event => {
  drawCoalescentTree();
};

const f = document.getElementById("foo");
f.addEventListener("submit", event => {
  event.preventDefault();
  drawCoalescentTree();
});
