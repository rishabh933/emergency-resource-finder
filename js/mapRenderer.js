/**
 * js/mapRenderer.js
 *
 * Canvas rendering layer for the map interface (Milestone 5, section 3).
 * Draws resources color-coded by type, the current query point, an
 * optional range-query radius circle, result highlights, and an optional
 * Quadtree quadrant overlay showing how the structure subdivided space.
 */

window.EFR = window.EFR || {};

EFR.MapRenderer = (function () {
  const COLORS = {
    hospital: "#e63946",
    ambulance: "#2a9d8f",
    fireStation: "#f4a261",
    query: "#1d3557",
    highlight: "#ffd166",
  };

  class MapRenderer {
    constructor(canvas, bounds) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.bounds = bounds;
      this.padding = 30;
    }

    worldToScreen(x, y) {
      const { minX, maxX, minY, maxY } = this.bounds;
      const w = this.canvas.width - 2 * this.padding;
      const h = this.canvas.height - 2 * this.padding;
      const sx = this.padding + ((x - minX) / (maxX - minX)) * w;
      // Flip y: larger y (north) should render near the top of the canvas.
      const sy = this.padding + (1 - (y - minY) / (maxY - minY)) * h;
      return { sx, sy };
    }

    screenToWorld(sx, sy) {
      const { minX, maxX, minY, maxY } = this.bounds;
      const w = this.canvas.width - 2 * this.padding;
      const h = this.canvas.height - 2 * this.padding;
      const x = minX + ((sx - this.padding) / w) * (maxX - minX);
      const y = minY + (1 - (sy - this.padding) / h) * (maxY - minY);
      return { x, y };
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawResources(resources) {
      for (const r of resources) {
        const { sx, sy } = this.worldToScreen(r.x, r.y);
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = COLORS[r.type] || "#888";
        this.ctx.fill();
        this.ctx.strokeStyle = "#222";
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
      }
    }

    drawQueryPoint(qx, qy) {
      const { sx, sy } = this.worldToScreen(qx, qy);
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      this.ctx.fillStyle = COLORS.query;
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#fff";
      this.ctx.stroke();
    }

    drawRadiusCircle(qx, qy, radius) {
      const { sx, sy } = this.worldToScreen(qx, qy);
      const edge = this.worldToScreen(qx + radius, qy);
      const screenRadius = Math.abs(edge.sx - sx);
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, screenRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(29, 53, 87, 0.45)";
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([5, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    highlightResults(matches) {
      for (const m of matches) {
        const { sx, sy } = this.worldToScreen(m.x, m.y);
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 9, 0, Math.PI * 2);
        this.ctx.strokeStyle = COLORS.highlight;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }
    }

    drawQuadtreeGrid(node) {
      if (!node) return;
      const { cx, cy, halfW, halfH } = node.boundary;
      const topLeft = this.worldToScreen(cx - halfW, cy + halfH);
      const bottomRight = this.worldToScreen(cx + halfW, cy - halfH);
      this.ctx.strokeStyle = "rgba(90, 90, 90, 0.25)";
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeRect(topLeft.sx, topLeft.sy, bottomRight.sx - topLeft.sx, bottomRight.sy - topLeft.sy);
      if (node.divided) {
        this.drawQuadtreeGrid(node.NW);
        this.drawQuadtreeGrid(node.NE);
        this.drawQuadtreeGrid(node.SW);
        this.drawQuadtreeGrid(node.SE);
      }
    }
  }

  return { MapRenderer, COLORS };
})();
