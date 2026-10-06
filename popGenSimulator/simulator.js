// Same 10 colors matplotlib uses by default
const COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
                "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

// Simulate one population; returns the frequency of A in each generation
function simulate(n, z, p0, wAA, wAa, waa) {
  let p = p0;
  const freqs = [p];
  for (let gen = 0; gen < z; gen++) {
    // Selection: change p according to genotype fitnesses
    const q = 1 - p;
    const wbar = p * p * wAA + 2 * p * q * wAa + q * q * waa;  // mean fitness
    if (wbar > 0) p = (p * p * wAA + p * q * wAa) / wbar;
    // Drift: each gene copy in the next generation picks a random parent copy
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) count++;
    }
    p = count / n;
    freqs.push(p);
  }
  return freqs;
}

function plot(canvas, runs, z, title) {
  // Match the canvas resolution to its on-screen size
  const scale = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const left = 60, right = 20, top = 40, bottom = 50;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const x = gen => left + (gen / z) * plotW;
  const y = freq => top + (1 - freq) * plotH;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillStyle = "#222";

  // Gridlines and y-axis ticks
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let f = 0; f <= 1.0001; f += 0.2) {
    ctx.strokeStyle = "#e5e5e5";
    ctx.beginPath();
    ctx.moveTo(left, y(f));
    ctx.lineTo(left + plotW, y(f));
    ctx.stroke();
    ctx.fillText(f.toFixed(1), left - 8, y(f));
  }

  // x-axis ticks (about 5 of them, at round numbers)
  const step = Math.max(1, Math.ceil(z / 5 / 5) * 5);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let gen = 0; gen <= z; gen += step) {
    ctx.fillText(gen, x(gen), top + plotH + 8);
  }

  // Axes
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, top + plotH);
  ctx.lineTo(left + plotW, top + plotH);
  ctx.stroke();

  // Axis labels and title
  ctx.fillText("Generation", left + plotW / 2, height - 22);
  ctx.save();
  ctx.translate(16, top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = "middle";
  ctx.fillText("Frequency of allele A", 0, 0);
  ctx.restore();
  // Shrink the title font on narrow screens so it fits
  let size = 15;
  do {
    ctx.font = `${size}px system-ui, sans-serif`;
  } while (ctx.measureText(title).width > width - 20 && --size > 8);
  ctx.textBaseline = "middle";
  ctx.fillText(title, left + plotW / 2, top / 2);

  // One line per replicate population
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  runs.forEach((freqs, rep) => {
    ctx.strokeStyle = COLORS[rep % COLORS.length];
    ctx.beginPath();
    freqs.forEach((f, gen) => {
      if (gen === 0) ctx.moveTo(x(gen), y(f));
      else ctx.lineTo(x(gen), y(f));
    });
    ctx.stroke();
  });
}

function run(event) {
  if (event) event.preventDefault();
  const get = id => Number(document.getElementById(id).value);
  const n = get("n"), z = get("z"), p0 = get("p0"), reps = get("reps");
  const wAA = get("wAA"), wAa = get("wAa"), waa = get("waa");

  // Check inputs before running
  const error = document.getElementById("error");
  let message = "";
  if (![n, z, reps].every(v => Number.isInteger(v) && v >= 1)) {
    message = "Population size, generations, and replicates must be whole numbers of at least 1.";
  } else if (!(p0 >= 0 && p0 <= 1)) {
    message = "Starting frequency must be between 0 and 1.";
  } else if (![wAA, wAa, waa].every(w => w >= 0) || wAA + wAa + waa === 0) {
    message = "Fitnesses must be 0 or greater, and not all 0.";
  }
  error.textContent = message;
  if (message) return;

  const runs = [];
  for (let rep = 0; rep < reps; rep++) {
    runs.push(simulate(n, z, p0, wAA, wAa, waa));
  }
  const title = `Drift and selection (n = ${n}, wAA = ${wAA}, wAa = ${wAa}, waa = ${waa})`;
  plot(document.getElementById("plot"), runs, z, title);

  // Count how many populations fixed A, fixed a, or are still polymorphic
  const finals = runs.map(freqs => freqs[freqs.length - 1]);
  const fixedA = finals.filter(p => p === 1).length;
  const fixeda = finals.filter(p => p === 0).length;
  document.getElementById("fixedA").textContent = `${fixedA} of ${reps}`;
  document.getElementById("fixeda").textContent = `${fixeda} of ${reps}`;
  document.getElementById("poly").textContent = `${reps - fixedA - fixeda} of ${reps}`;
}

document.getElementById("controls").addEventListener("submit", run);
run();
