/**
 * js/main.js
 *
 * Wires the UI (map canvas + control panel + metrics panel) to the three
 * search engines (brute-force, Quadtree, K-D Tree), following the query
 * interface contract described in Milestone 5.
 */

(function () {
  const { resources, bounds } = EFR.resourceModel.load();
  const canvas = document.getElementById("mapCanvas");
  const renderer = new EFR.MapRenderer.MapRenderer(canvas, bounds);

  // Build one Quadtree and one K-D Tree per resource type (Milestone 3 &
  // Milestone 4 design decision: per-type indices avoid mid-traversal
  // filtering by type).
  const TYPES = [EFR.RESOURCE_TYPES.HOSPITAL, EFR.RESOURCE_TYPES.AMBULANCE, EFR.RESOURCE_TYPES.FIRE_STATION];
  const quadtrees = {};
  const kdtrees = {};

  for (const t of TYPES) {
    const pts = resources.filter((r) => r.type === t);

    const qt = new EFR.Quadtree.Quadtree(
      new EFR.Quadtree.Rectangle(
        (bounds.minX + bounds.maxX) / 2,
        (bounds.minY + bounds.maxY) / 2,
        (bounds.maxX - bounds.minX) / 2,
        (bounds.maxY - bounds.minY) / 2
      ),
      4
    );
    for (const p of pts) qt.insert(p);
    quadtrees[t] = qt;

    kdtrees[t] = new EFR.KDTree.KDTree(pts);
  }

  let queryPoint = null; // {x, y} in projected meters
  let lastMatches = [];
  let showGrid = false;

  const typeSelect = document.getElementById("resourceType");
  const modeSelect = document.getElementById("queryMode");
  const radiusSlider = document.getElementById("radiusSlider");
  const radiusValue = document.getElementById("radiusValue");
  const showGridCheckbox = document.getElementById("showGrid");
  const runBtn = document.getElementById("runQueryBtn");
  const locateBtn = document.getElementById("locateBtn");
  const metricsBody = document.getElementById("metricsBody");
  const consistencyNote = document.getElementById("consistencyNote");
  const resultsList = document.getElementById("resultsList");
  const hint = document.getElementById("hint");

  function redraw() {
    renderer.clear();
    if (showGrid) {
      renderer.drawQuadtreeGrid(quadtrees[typeSelect.value].root);
    }
    renderer.drawResources(resources);
    if (queryPoint) {
      if (modeSelect.value === "range") {
        renderer.drawRadiusCircle(queryPoint.x, queryPoint.y, Number(radiusSlider.value));
      }
      renderer.drawQueryPoint(queryPoint.x, queryPoint.y);
    }
    if (lastMatches.length) {
      renderer.highlightResults(lastMatches);
    }
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    queryPoint = renderer.screenToWorld(sx, sy);
    lastMatches = [];
    hint.textContent = "Query point placed. Click \u201cRun Query\u201d to search.";
    redraw();
  });

  modeSelect.addEventListener("change", () => {
    radiusSlider.parentElement.style.display = modeSelect.value === "range" ? "flex" : "none";
    redraw();
  });

  radiusSlider.addEventListener("input", () => {
    radiusValue.textContent = radiusSlider.value + " m";
    redraw();
  });

  showGridCheckbox.addEventListener("change", (e) => {
    showGrid = e.target.checked;
    redraw();
  });

  typeSelect.addEventListener("change", () => {
    lastMatches = [];
    redraw();
  });

  function sameMatchSet(a, b) {
    const idsA = new Set(a.map((p) => p.id));
    const idsB = new Set(b.map((p) => p.id));
    if (idsA.size !== idsB.size) return false;
    for (const id of idsA) if (!idsB.has(id)) return false;
    return true;
  }

  function renderMetrics(results, consistent) {
    metricsBody.innerHTML = "";
    for (const [name, res] of Object.entries(results)) {
      const tr = document.createElement("tr");
      const label = { bruteforce: "Brute-force", quadtree: "Quadtree", kdtree: "K-D Tree" }[name];
      tr.innerHTML = `<td>${label}</td><td>${res.matches.length}</td><td>${res.nodesVisited}</td><td>${res.timeMs.toFixed(3)}</td>`;
      metricsBody.appendChild(tr);
    }
    consistencyNote.textContent = consistent
      ? "\u2713 All three approaches returned the same result set."
      : "\u2717 Mismatch between approaches \u2014 check console.";
    consistencyNote.className = consistent ? "ok" : "warn";

    resultsList.innerHTML = "";
    if (results.bruteforce.matches.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No matching resources found.";
      resultsList.appendChild(li);
    }
    for (const p of results.bruteforce.matches) {
      const li = document.createElement("li");
      const dist = Math.hypot(p.x - queryPoint.x, p.y - queryPoint.y);
      const distText = dist >= 1000 ? (dist / 1000).toFixed(2) + " km" : Math.round(dist) + " m";
      li.textContent = `${p.name} \u2014 ${p.area} (${distText} away)`;
      resultsList.appendChild(li);
    }
  }

  function runQuery() {
    if (!queryPoint) {
      hint.textContent = "Click anywhere on the map first to place a query point.";
      return;
    }
    const type = typeSelect.value;
    const mode = modeSelect.value;
    const radius = Number(radiusSlider.value);

    let bf, qt, kd;
    if (mode === "nearest") {
      bf = EFR.bruteForce.nearestNeighbor(resources, queryPoint, type);
      qt = quadtrees[type].nearestNeighbor(queryPoint.x, queryPoint.y);
      kd = kdtrees[type].nearestNeighbor(queryPoint.x, queryPoint.y);
    } else {
      bf = EFR.bruteForce.rangeQuery(resources, queryPoint, radius, type);
      qt = quadtrees[type].rangeQuery(queryPoint.x, queryPoint.y, radius);
      kd = kdtrees[type].rangeQuery(queryPoint.x, queryPoint.y, radius);
    }

    const consistent = sameMatchSet(bf.matches, qt.matches) && sameMatchSet(bf.matches, kd.matches);
    if (!consistent) {
      console.warn("Result mismatch between engines:", { bruteforce: bf.matches, quadtree: qt.matches, kdtree: kd.matches });
    }

    lastMatches = bf.matches; // ground truth, used for the map highlight
    renderMetrics({ bruteforce: bf, quadtree: qt, kdtree: kd }, consistent);
    hint.textContent = "";
    redraw();
  }

  runBtn.addEventListener("click", runQuery);

  // ---- "Use my location" (browser Geolocation API) ----
  const COVERAGE_MARGIN_M = 3000; // how far outside the dataset's bounding box we still accept

  function insideCoverage(p) {
    return (
      p.x >= bounds.minX - COVERAGE_MARGIN_M && p.x <= bounds.maxX + COVERAGE_MARGIN_M &&
      p.y >= bounds.minY - COVERAGE_MARGIN_M && p.y <= bounds.maxY + COVERAGE_MARGIN_M
    );
  }

  function onLocationSuccess(pos) {
    const { latitude, longitude } = pos.coords;
    const ref = EFR.GWALIOR_CENTER;
    const p = EFR.geo.latLonToXY(latitude, longitude, ref.lat, ref.lon);

    if (!insideCoverage(p)) {
      hint.textContent =
        `Your location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) is outside the Gwalior area covered by this demo. ` +
        "Click on the map to simulate a location inside Gwalior instead.";
      locateBtn.disabled = false;
      return;
    }

    queryPoint = p;
    lastMatches = [];
    locateBtn.disabled = false;
    runQuery();
    hint.textContent = `Using your location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).`;
  }

  function onLocationError(err) {
    locateBtn.disabled = false;
    const fileNote = location.protocol === "file:"
      ? " Tip: some browsers block location for pages opened directly from disk \u2014 use the https GitHub Pages link or run a local server (http://localhost)."
      : "";
    if (err.code === 1) {
      hint.textContent = "Location permission was denied. Allow location access for this site in your browser settings, or click on the map instead." + fileNote;
    } else if (err.code === 2) {
      hint.textContent = "Your location couldn't be determined. Click on the map to place a query point instead." + fileNote;
    } else if (err.code === 3) {
      hint.textContent = "Getting your location timed out. Try again, or click on the map instead.";
    } else {
      hint.textContent = "Couldn't get your location. Click on the map instead." + fileNote;
    }
  }

  locateBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      hint.textContent = "This browser doesn't support geolocation. Click on the map to place a query point instead.";
      return;
    }
    hint.textContent = "Requesting your location\u2026 please click \u201cAllow\u201d when your browser asks.";
    locateBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });

  // Initial state
  radiusSlider.parentElement.style.display = modeSelect.value === "range" ? "flex" : "none";
  redraw();
})();
