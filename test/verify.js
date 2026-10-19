// Standalone Node.js correctness check (not part of the browser app).
// Loads the same files the browser would, in a minimal shimmed environment,
// and verifies Quadtree / K-D Tree results match brute-force on real data.

global.window = global;
global.performance = require("perf_hooks").performance;

const fs = require("fs");
const path = require("path");

function load(relPath) {
  const code = fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
  eval(code);
}

load("data/resources.js");
load("js/geo.js");
load("js/resourceModel.js");
load("js/bruteForce.js");
load("js/quadtree.js");
load("js/kdtree.js");

const { resources, bounds } = EFR.resourceModel.load();
console.log(`Loaded ${resources.length} resources.`);
console.log("Bounds (meters):", bounds);

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
  console.log(`${t}: ${pts.length} points indexed`);
}

function sameSet(a, b) {
  const idsA = new Set(a.map((p) => p.id));
  const idsB = new Set(b.map((p) => p.id));
  if (idsA.size !== idsB.size) return false;
  for (const id of idsA) if (!idsB.has(id)) return false;
  return true;
}

let failures = 0;
let checks = 0;

function randPoint() {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

// Nearest-neighbor correctness across many random query points and all types
for (const t of TYPES) {
  for (let i = 0; i < 200; i++) {
    const q = randPoint();
    const bf = EFR.bruteForce.nearestNeighbor(resources, q, t);
    const qt = quadtrees[t].nearestNeighbor(q.x, q.y);
    const kd = kdtrees[t].nearestNeighbor(q.x, q.y);
    checks++;
    if (!sameSet(bf.matches, qt.matches)) {
      failures++;
      console.error(`NN MISMATCH (quadtree, ${t}) at`, q, "bf:", bf.matches[0]?.id, "qt:", qt.matches[0]?.id);
    }
    if (!sameSet(bf.matches, kd.matches)) {
      failures++;
      console.error(`NN MISMATCH (kdtree, ${t}) at`, q, "bf:", bf.matches[0]?.id, "kd:", kd.matches[0]?.id);
    }
  }
}

// Range-query correctness across several radii
const radii = [500, 1000, 2000, 4000, 8000];
for (const t of TYPES) {
  for (const r of radii) {
    for (let i = 0; i < 40; i++) {
      const q = randPoint();
      const bf = EFR.bruteForce.rangeQuery(resources, q, r, t);
      const qt = quadtrees[t].rangeQuery(q.x, q.y, r);
      const kd = kdtrees[t].rangeQuery(q.x, q.y, r);
      checks++;
      if (!sameSet(bf.matches, qt.matches)) {
        failures++;
        console.error(`RANGE MISMATCH (quadtree, ${t}, r=${r}) at`, q, "bf:", bf.matches.map(p=>p.id), "qt:", qt.matches.map(p=>p.id));
      }
      if (!sameSet(bf.matches, kd.matches)) {
        failures++;
        console.error(`RANGE MISMATCH (kdtree, ${t}, r=${r}) at`, q, "bf:", bf.matches.map(p=>p.id), "kd:", kd.matches.map(p=>p.id));
      }
    }
  }
}

console.log(`\n${checks} checks run, ${failures} failures.`);
if (failures > 0) {
  process.exit(1);
} else {
  console.log("All brute-force / Quadtree / K-D Tree results match. ✔");
}

// Also do a quick sample nearest-hospital query near City Centre to sanity check output.
const cityCentreQuery = EFR.geo.latLonToXY(26.212, 78.190, EFR.GWALIOR_CENTER.lat, EFR.GWALIOR_CENTER.lon);
const nearestHospital = EFR.bruteForce.nearestNeighbor(resources, cityCentreQuery, "hospital");
console.log("\nSample query — nearest hospital to City Centre (26.212, 78.190):");
console.log(nearestHospital.matches[0]);
