/**
 * js/bruteForce.js
 *
 * Brute-force linear search baseline (Milestone 2 / Milestone 1 FR6).
 * Scans every point in the dataset for both nearest-neighbor and range
 * queries, recording nodes-visited (comparisons made) and time-taken so
 * it can be compared against the Quadtree and K-D Tree implementations.
 */

window.EFR = window.EFR || {};

EFR.bruteForce = (function () {
  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function nearestNeighbor(dataset, query, type) {
    const t0 = performance.now();
    let best = null;
    let bestDist = Infinity;
    let visited = 0;
    for (const p of dataset) {
      if (p.type !== type) continue;
      visited++;
      const d = dist2(p, query);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    const timeMs = performance.now() - t0;
    return { matches: best ? [best] : [], nodesVisited: visited, timeMs };
  }

  function rangeQuery(dataset, query, radius, type) {
    const t0 = performance.now();
    const r2 = radius * radius;
    const matches = [];
    let visited = 0;
    for (const p of dataset) {
      if (p.type !== type) continue;
      visited++;
      if (dist2(p, query) <= r2) matches.push(p);
    }
    const timeMs = performance.now() - t0;
    return { matches, nodesVisited: visited, timeMs };
  }

  return { nearestNeighbor, rangeQuery };
})();
