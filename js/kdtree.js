/**
 * js/kdtree.js
 *
 * K-D Tree implementation for multidimensional nearest-neighbor search
 * (Milestone 4). Built via median-based splitting (guaranteed balanced),
 * alternating the splitting axis by depth (x, y, x, y, ...). Also
 * includes a range-query method, added for symmetry with the Quadtree
 * so both structures can be benchmarked on both query types.
 */

window.EFR = window.EFR || {};

EFR.KDTree = (function () {
  class KDNode {
    constructor(point, axis) {
      this.point = point;
      this.axis = axis; // 0 = x, 1 = y
      this.left = null;
      this.right = null;
    }
  }

  function build(points, depth = 0) {
    if (points.length === 0) return null;
    const axis = depth % 2;
    const key = axis === 0 ? "x" : "y";
    const sorted = [...points].sort((a, b) => a[key] - b[key]);
    const medianIndex = Math.floor(sorted.length / 2);
    const node = new KDNode(sorted[medianIndex], axis);
    node.left = build(sorted.slice(0, medianIndex), depth + 1);
    node.right = build(sorted.slice(medianIndex + 1), depth + 1);
    return node;
  }

  class KDTree {
    constructor(points) {
      this.root = build(points);
    }

    nearestNeighbor(qx, qy) {
      const t0 = performance.now();
      let visited = 0;
      let best = null;
      let bestDist = Infinity;

      function search(node) {
        if (!node) return;
        visited++;
        const dx = node.point.x - qx;
        const dy = node.point.y - qy;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = node.point;
        }

        const axis = node.axis;
        const qVal = axis === 0 ? qx : qy;
        const nodeVal = axis === 0 ? node.point.x : node.point.y;
        const nearSide = qVal < nodeVal ? node.left : node.right;
        const farSide = qVal < nodeVal ? node.right : node.left;

        search(nearSide);

        // Only explore the far side if the splitting plane is closer
        // than the current best distance -- it might hide a closer point.
        const axisDist = qVal - nodeVal;
        if (axisDist * axisDist < bestDist) {
          search(farSide);
        }
      }

      search(this.root);
      const timeMs = performance.now() - t0;
      return { matches: best ? [best] : [], nodesVisited: visited, timeMs };
    }

    rangeQuery(qx, qy, radius) {
      const t0 = performance.now();
      let visited = 0;
      const matches = [];
      const r2 = radius * radius;

      function search(node) {
        if (!node) return;
        visited++;
        const dx = node.point.x - qx;
        const dy = node.point.y - qy;
        if (dx * dx + dy * dy <= r2) matches.push(node.point);

        const axis = node.axis;
        const qVal = axis === 0 ? qx : qy;
        const nodeVal = axis === 0 ? node.point.x : node.point.y;
        const axisDist = qVal - nodeVal;

        if (qVal < nodeVal) {
          search(node.left);
          if (axisDist * axisDist <= r2) search(node.right);
        } else {
          search(node.right);
          if (axisDist * axisDist <= r2) search(node.left);
        }
      }

      search(this.root);
      const timeMs = performance.now() - t0;
      return { matches, nodesVisited: visited, timeMs };
    }
  }

  return { KDTree };
})();
