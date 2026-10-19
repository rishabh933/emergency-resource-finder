/**
 * js/benchmark.js
 *
 * Implements the benchmarking methodology defined in Milestone 2:
 * generates synthetic datasets of increasing size within the Gwalior
 * bounding box, builds a Quadtree and K-D Tree for each size, and
 * compares nodes-visited / time-taken for nearest-neighbor queries
 * against the brute-force baseline, averaged over repeated random
 * query points.
 */

(function () {
  const SIZES = [100, 500, 1000, 2000, 5000];
  const REPEATS = 20;

  function randomPointInBounds(bounds) {
    return {
      x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
    };
  }

  function generateDataset(n, bounds) {
    const types = [EFR.RESOURCE_TYPES.HOSPITAL, EFR.RESOURCE_TYPES.AMBULANCE, EFR.RESOURCE_TYPES.FIRE_STATION];
    const pts = [];
    for (let i = 0; i < n; i++) {
      const { x, y } = randomPointInBounds(bounds);
      pts.push({ id: "synthetic-" + i, type: types[i % 3], name: "Synthetic Resource " + i, area: "Generated", x, y });
    }
    return pts;
  }

  function buildIndices(pts, bounds) {
    const qt = new EFR.Quadtree.Quadtree(
      new EFR.Quadtree.Rectangle(
        (bounds.minX + bounds.maxX) / 2,
        (bounds.minY + bounds.maxY) / 2,
        (bounds.maxX - bounds.minX) / 2,
        (bounds.maxY - bounds.minY) / 2
      ),
      4
    );
    const t0 = performance.now();
    for (const p of pts) qt.insert(p);
    const qtBuildMs = performance.now() - t0;

    const t1 = performance.now();
    const kd = new EFR.KDTree.KDTree(pts);
    const kdBuildMs = performance.now() - t1;

    return { qt, kd, qtBuildMs, kdBuildMs };
  }

  function runBenchmark() {
    const bounds = EFR.resourceModel.getGwaliorBounds();
    const tbody = document.getElementById("benchBody");
    tbody.innerHTML = "";
    const rows = [];

    for (const n of SIZES) {
      const pts = generateDataset(n, bounds);
      const { qt, kd, qtBuildMs, kdBuildMs } = buildIndices(pts, bounds);

      let bfTime = 0, bfNodes = 0;
      let qtTime = 0, qtNodes = 0;
      let kdTime = 0, kdNodes = 0;

      for (let i = 0; i < REPEATS; i++) {
        const q = randomPointInBounds(bounds);
        const type = EFR.RESOURCE_TYPES.HOSPITAL;

        const bf = EFR.bruteForce.nearestNeighbor(pts, q, type);
        bfTime += bf.timeMs;
        bfNodes += bf.nodesVisited;

        const qr = qt.nearestNeighbor(q.x, q.y);
        qtTime += qr.timeMs;
        qtNodes += qr.nodesVisited;

        const kr = kd.nearestNeighbor(q.x, q.y);
        kdTime += kr.timeMs;
        kdNodes += kr.nodesVisited;
      }

      const row = {
        n,
        bfTime: bfTime / REPEATS, bfNodes: bfNodes / REPEATS,
        qtTime: qtTime / REPEATS, qtNodes: qtNodes / REPEATS, qtBuildMs,
        kdTime: kdTime / REPEATS, kdNodes: kdNodes / REPEATS, kdBuildMs,
      };
      rows.push(row);
      appendRow(tbody, row);
    }

    drawChart(rows);
  }

  function appendRow(tbody, row) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.n.toLocaleString()}</td>
      <td>${row.bfNodes.toFixed(1)}</td><td>${row.bfTime.toFixed(3)}</td>
      <td>${row.qtNodes.toFixed(1)}</td><td>${row.qtTime.toFixed(3)}</td><td>${row.qtBuildMs.toFixed(2)}</td>
      <td>${row.kdNodes.toFixed(1)}</td><td>${row.kdTime.toFixed(3)}</td><td>${row.kdBuildMs.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }

  function drawChart(rows) {
    const canvas = document.getElementById("benchChart");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 45;
    const w = canvas.width - 2 * pad;
    const h = canvas.height - 2 * pad;
    const maxTime = Math.max(...rows.map((r) => Math.max(r.bfTime, r.qtTime, r.kdTime))) || 1;
    const groupW = w / rows.length;

    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + h);
    ctx.lineTo(pad + w, pad + h);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font = "11px sans-serif";
    ctx.fillText("avg. query time (ms)", 6, pad - 10);

    rows.forEach((d, i) => {
      const bx = pad + i * groupW + 12;
      const barW = (groupW - 24) / 3;
      drawBar(ctx, bx, pad + h, barW, (d.bfTime / maxTime) * h, "#e63946");
      drawBar(ctx, bx + barW, pad + h, barW, (d.qtTime / maxTime) * h, "#2a9d8f");
      drawBar(ctx, bx + 2 * barW, pad + h, barW, (d.kdTime / maxTime) * h, "#457b9d");
      ctx.fillStyle = "#333";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N=" + d.n, bx + 1.5 * barW, pad + h + 16);
      ctx.textAlign = "left";
    });
  }

  function drawBar(ctx, x, baseY, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, w, Math.max(h, 1));
  }

  document.getElementById("runBenchBtn").addEventListener("click", (e) => {
    e.target.disabled = true;
    e.target.textContent = "Running...";
    // Let the UI repaint before the (synchronous, CPU-bound) benchmark runs.
    setTimeout(() => {
      runBenchmark();
      e.target.disabled = false;
      e.target.textContent = "Run Benchmark Again";
    }, 30);
  });
})();
