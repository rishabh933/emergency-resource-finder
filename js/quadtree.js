/**
 * js/quadtree.js
 *
 * Quadtree implementation for 2D regional indexing (Milestone 3).
 * Node capacity defaults to 4. Range queries prune entire quadrants
 * that don't intersect the query circle; nearest-neighbor is answered
 * via the range-expansion approach described in Milestone 3, section 4.4.
 */

window.EFR = window.EFR || {};

EFR.Quadtree = (function () {
  class Rectangle {
    constructor(cx, cy, halfW, halfH) {
      this.cx = cx;
      this.cy = cy;
      this.halfW = halfW;
      this.halfH = halfH;
    }
    contains(p) {
      return (
        p.x >= this.cx - this.halfW &&
        p.x <= this.cx + this.halfW &&
        p.y >= this.cy - this.halfH &&
        p.y <= this.cy + this.halfH
      );
    }
    // Circle-rectangle intersection test used to prune quadrants during range queries.
    intersectsCircle(cx, cy, r) {
      const dx = Math.max(Math.abs(cx - this.cx) - this.halfW, 0);
      const dy = Math.max(Math.abs(cy - this.cy) - this.halfH, 0);
      return dx * dx + dy * dy <= r * r;
    }
  }

  class QuadNode {
    constructor(boundary, capacity) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
      this.NW = this.NE = this.SW = this.SE = null;
    }

    subdivide() {
      const { cx, cy, halfW, halfH } = this.boundary;
      const w = halfW / 2;
      const h = halfH / 2;
      this.NW = new QuadNode(new Rectangle(cx - w, cy - h, w, h), this.capacity);
      this.NE = new QuadNode(new Rectangle(cx + w, cy - h, w, h), this.capacity);
      this.SW = new QuadNode(new Rectangle(cx - w, cy + h, w, h), this.capacity);
      this.SE = new QuadNode(new Rectangle(cx + w, cy + h, w, h), this.capacity);
      this.divided = true;
    }

    insert(point) {
      if (!this.boundary.contains(point)) return false;

      if (this.points.length < this.capacity && !this.divided) {
        this.points.push(point);
        return true;
      }

      if (!this.divided) {
        this.subdivide();
        const existing = this.points;
        this.points = [];
        for (const p of existing) {
          this.NW.insert(p) || this.NE.insert(p) || this.SW.insert(p) || this.SE.insert(p);
        }
      }

      return this.NW.insert(point) || this.NE.insert(point) || this.SW.insert(point) || this.SE.insert(point);
    }
  }

  class Quadtree {
    constructor(boundary, capacity = 4) {
      this.root = new QuadNode(boundary, capacity);
    }

    insert(point) {
      return this.root.insert(point);
    }

    rangeQuery(qx, qy, radius) {
      const t0 = performance.now();
      const result = { matches: [], nodesVisited: 0 };
      this._rangeQueryNode(this.root, qx, qy, radius, result);
      result.timeMs = performance.now() - t0;
      return result;
    }

    _rangeQueryNode(node, qx, qy, radius, result) {
      result.nodesVisited++;
      if (!node.boundary.intersectsCircle(qx, qy, radius)) return; // prune

      const r2 = radius * radius;
      for (const p of node.points) {
        const dx = p.x - qx;
        const dy = p.y - qy;
        if (dx * dx + dy * dy <= r2) result.matches.push(p);
      }

      if (node.divided) {
        this._rangeQueryNode(node.NW, qx, qy, radius, result);
        this._rangeQueryNode(node.NE, qx, qy, radius, result);
        this._rangeQueryNode(node.SW, qx, qy, radius, result);
        this._rangeQueryNode(node.SE, qx, qy, radius, result);
      }
    }

    // Nearest neighbor via expanding-radius range query (Milestone 3, section 4.4).
    nearestNeighbor(qx, qy, initialRadius = 300, maxRadius = 5000000) {
      const t0 = performance.now();
      let radius = initialRadius;
      let visited = 0;
      let candidates = [];

      while (radius <= maxRadius) {
        const res = this.rangeQuery(qx, qy, radius);
        visited += res.nodesVisited;
        if (res.matches.length > 0) {
          candidates = res.matches;
          break;
        }
        radius *= 2;
      }

      let best = null;
      let bestDist = Infinity;
      for (const p of candidates) {
        const dx = p.x - qx;
        const dy = p.y - qy;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }

      const timeMs = performance.now() - t0;
      return { matches: best ? [best] : [], nodesVisited: visited, timeMs };
    }
  }

  return { Quadtree, Rectangle };
})();
