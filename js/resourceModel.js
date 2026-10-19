/**
 * js/resourceModel.js
 *
 * Builds the in-memory resource dataset (shared by all three search
 * strategies, per the common dataset layer described in Milestone 2)
 * by projecting the raw lat/lon resource records into planar (x, y)
 * coordinates, and computes the bounding box used as the Quadtree's
 * root region.
 */

window.EFR = window.EFR || {};

EFR.resourceModel = (function () {
  let cachedResources = null;
  let cachedBounds = null;

  function project() {
    const ref = EFR.GWALIOR_CENTER;
    return EFR.RAW_RESOURCES.map((r) => {
      const { x, y } = EFR.geo.latLonToXY(r.lat, r.lon, ref.lat, ref.lon);
      return { ...r, x, y };
    });
  }

  function computeBounds(resources) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const r of resources) {
      if (r.x < minX) minX = r.x;
      if (r.x > maxX) maxX = r.x;
      if (r.y < minY) minY = r.y;
      if (r.y > maxY) maxY = r.y;
    }
    // Pad the bounding box by 10% so edge points aren't flush against it.
    const padX = (maxX - minX) * 0.1 || 1000;
    const padY = (maxY - minY) * 0.1 || 1000;
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }

  function load() {
    if (!cachedResources) {
      cachedResources = project();
      cachedBounds = computeBounds(cachedResources);
    }
    return { resources: cachedResources, bounds: cachedBounds };
  }

  function getGwaliorBounds() {
    return load().bounds;
  }

  return { load, getGwaliorBounds };
})();
