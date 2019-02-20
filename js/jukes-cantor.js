const branchLengthSlider = new Slider("#ex9", {
  tooltip: "always"
});

branchLengthSlider.on('slideStop', function(){
  let newValue = parseFloat(branchLengthSlider.getValue());
  showValueAppendScale(newValue);
})

function showValueAppendScale(val) {
  // document.getElementById("brl").innerHTML = val;
  appendScale(val);
}

function appendScale(val) {
  let plotSvg = d3
    .select("#histories")
    .append("svg")
    .attr("width", 800)
    .attr("height", 20);
  plotSvg
    .append("line")
    .attr("x1", 0)
    .attr("x2", 800)
    .attr("y1", 19)
    .attr("y2", 19)
    .attr("stroke", "black")
    .attr("stroke-width", 2);
  plotSvg
    .append("line")
    .attr("x1", 1)
    .attr("x2", 1)
    .attr("y1", 20)
    .attr("y2", 15)
    .attr("stroke", "black")
    .attr("stroke-width", 2);
  plotSvg
    .append("line")
    .attr("x1", 800 - 1)
    .attr("x2", 800 - 1)
    .attr("y1", 20)
    .attr("y2", 15)
    .attr("stroke", "black")
    .attr("stroke-width", 2);
  plotSvg
    .append("text")
    .attr("fill", "black")
    .attr("x", 0)
    .attr("text-anchor", "start")
    .attr("font-size", "14px")
    .attr("y", 10)
    .text("0.0");
  plotSvg
    .append("text")
    .attr("fill", "black")
    .attr("x", 800)
    .attr("text-anchor", "end")
    .attr("font-size", "14px")
    .attr("y", 10)
    .text(val);
  d3.select("#histories").append("br");
}

let model = new Model(
  (bf = [0.25, 0.25, 0.25, 0.25]),
  (rates = [1, 1, 1, 1, 1, 1]),
  (gammaRates = true),
  (alpha = 10),
  (invSites = false),
  (i = 0)
);

let myCharHistory = new characterHistory((model = model));

let startState = document.getElementById("fixStart").checked ? "A" : null;

let show = document.getElementById("showStates").checked;

d3.select("#clearCharHists").on("click", function() {
  d3
    .select("#histories")
    .selectAll("svg")
    .remove();
  d3
    .select("#histories")
    .selectAll("br")
    .remove();
  const branchLength = parseFloat(branchLengthSlider.getValue());
  appendScale(branchLength);
});

d3.select("#drawCharHist").on("click", function() {
  const branchLength = parseFloat(branchLengthSlider.getValue());
  startState = document.getElementById("fixStart").checked ? "A" : null;
  myCharHistory.sampleHistory(branchLength, startState);
  let plotSvg = d3.select("#histories").append("svg");
  myCharHistory.drawHistory(
    branchLength,
    (w = 800),
    (h = 30),
    (svg = plotSvg),
    (showStates = document.getElementById("showStates").checked)
  );
  plotSvg.datum([myCharHistory.states, myCharHistory.waitingTimes]);

  plotSvg.on("mouseover", function(d) {
    // total hack. should find a better way to position tooltip instead hardcoding values.
    console.log("x", d3.event.clientX);
    console.log("y", d3.event.clientY);
    d3
      .select("#tooltip")
      .style("left", d3.event.clientX - 300 + "px")
      .style("top", d3.event.clientY - 65 + "px");
    if (d[0].length === 1) {
      d3
        .select("#tooltip")
        .select("#value")
        .append("p")
        .text("No character changes.");
    }
    for (let i = 0; i < d[0].length - 1; i++) {
      d3
        .select("#tooltip")
        .select("#value")
        .append("p")
        .text(
          d[0][i] +
            " -> " +
            d[0][i + 1] +
            "  (" +
            parseFloat(d[1][i]).toFixed(4) +
            ")"
        );
    }
    d3.select("#tooltip").classed("hidden", false);
  });

  plotSvg.on("mouseout", function() {
    //Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
    d3
      .select("#tooltip")
      .select("#value")
      .selectAll("p")
      .remove();
  });

  d3.select("#histories").append("br");
});
// d3.select("#brlSlider").property("value", 1.0);
showValueAppendScale(branchLengthSlider.getValue());