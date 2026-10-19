/**
 * js/geo.js
 *
 * Projects latitude/longitude pairs into a local planar (x, y) coordinate
 * system measured in meters, using an equirectangular approximation
 * centered on a reference point. This is sufficiently accurate for a
 * single-city scale (Gwalior) and keeps all downstream spatial structures
 * (Quadtree, K-D Tree, brute-force) working with simple Euclidean distance.
 */

window.EFR = window.EFR || {};

EFR.geo = (function () {
  const METERS_PER_DEGREE_LAT = 110574; // ~constant across latitudes
  const METERS_PER_DEGREE_LON_AT_EQUATOR = 111320;

  function latLonToXY(lat, lon, refLat, refLon) {
    const x = (lon - refLon) * METERS_PER_DEGREE_LON_AT_EQUATOR * Math.cos((refLat * Math.PI) / 180);
    const y = (lat - refLat) * METERS_PER_DEGREE_LAT;
    return { x, y };
  }

  function xyToLatLon(x, y, refLat, refLon) {
    const lat = refLat + y / METERS_PER_DEGREE_LAT;
    const lon = refLon + x / (METERS_PER_DEGREE_LON_AT_EQUATOR * Math.cos((refLat * Math.PI) / 180));
    return { lat, lon };
  }

  return { latLonToXY, xyToLatLon };
})();
