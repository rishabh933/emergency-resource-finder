# 🚑 Smart Emergency Resource Finder — Using Quadtree & K-D Tree

A college micro-project developing Quadtree and K-D Tree algorithms for
multidimensional range query analysis, applied to a real-world use case:
fast nearest-resource and range lookup for emergency hospitals, ambulance
services, and fire stations across **Gwalior, Madhya Pradesh, India**.

**Live demo:** _add your GitHub Pages link here after deploying (see below)_

## What this is

Three search strategies, built from scratch, compared head-to-head on the
same real dataset and the same queries:

| Approach     | Best at                  | Avg. complexity         |
|--------------|---------------------------|--------------------------|
| Brute-force  | Baseline / correctness    | O(n)                     |
| Quadtree     | Range / region queries    | O(log n + k) build O(n)  |
| K-D Tree     | Nearest-neighbor queries  | O(log n), build O(n log n) |

Press **📍 Use my location** (the browser will ask for permission) or click
anywhere on the map to drop a query point, pick a resource type
(hospital / ambulance / fire station) and a query mode (nearest or
range), and run the query — all three engines run on the same input and
the panel shows how many nodes each one visited and how long it took.

A separate **Benchmark** page generates synthetic datasets of increasing
size and plots how each approach scales, implementing the methodology
from this project's Milestone 2 document.

## Project structure

```
emergency-resource-finder/
├── index.html              # Main map demo
├── benchmark.html          # Performance benchmark page
├── css/
│   └── style.css
├── js/
│   ├── geo.js               # lat/lon → planar (x, y) projection
│   ├── resourceModel.js     # builds the shared dataset + bounding box
│   ├── bruteForce.js        # brute-force linear search baseline
│   ├── quadtree.js          # Quadtree: insert, subdivide, range query, NN
│   ├── kdtree.js             # K-D Tree: median build, NN search, range query
│   ├── mapRenderer.js        # Canvas rendering (map, markers, overlays)
│   ├── main.js                # Wires the map demo UI together
│   └── benchmark.js           # Wires the benchmark page together
├── data/
│   └── resources.js          # Real Gwalior dataset (hospitals, ambulances, fire stations)
├── README.md
├── LICENSE
└── .gitignore
```

## Running it

No build step, no dependencies, no npm install. Just open `index.html` in
a browser. If your browser restricts local `file://` access for some
reason, serve the folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

### About "Use my location"

The button uses the browser's Geolocation API, which only works on
secure origins: the GitHub Pages `https://` link or `http://localhost`.
Some browsers block it for pages opened straight from disk (`file://`) —
if that happens, use the deployed link or run `python3 -m http.server`
and open `http://localhost:8000`. The demo covers Gwalior only; if your
real location is outside the city, you'll be prompted to click a spot on
the map instead.

## The dataset

38 real emergency resource locations in Gwalior — 24 hospitals, 10
ambulance services, and 4 fire stations — spanning City Centre,
Govindpuri, DD Nagar (Deen Dayal Nagar), Thatipur, Lashkar, and Morar.
Compiled from public place listings (Google Places) in October 2026 for
this academic demonstration. Real-world facility names, locations, and
operating status change over time — **this dataset is not suitable for
actual emergency dispatch.**

Coordinates are projected from latitude/longitude into local planar
meters (`js/geo.js`) using an equirectangular approximation centered on
Gwalior, so that both the Quadtree and the K-D Tree can operate with
simple Euclidean distance, and so that range-query radii are expressed
in real meters.

## How the algorithms work (summary)

Full design docs, pseudocode, and complexity analysis are in this
project's milestone write-ups (Milestones 1–5). In short:

- **Quadtree** (`js/quadtree.js`) recursively splits the map into four
  quadrants whenever a region holds more than 4 points, and prunes
  quadrants that don't intersect a query circle during a range search.
  Nearest-neighbor is answered by expanding the search radius until a
  match is found.
- **K-D Tree** (`js/kdtree.js`) recursively splits the point set at the
  median, alternating between the x and y axis at each depth, producing
  a guaranteed-balanced tree. Nearest-neighbor search descends toward
  the query point and backtracks only into branches that could still
  contain a closer point.
- **Brute-force** (`js/bruteForce.js`) scans every point — the baseline
  both structures are checked against for correctness.

Every query run in the UI checks that all three approaches return the
same result set before displaying it, surfacing a warning if they ever
disagree.

## Verifying correctness

`test/verify.js` is a standalone Node.js script (not part of the browser
app) that loads the same algorithm files, runs 1,200+ randomized
nearest-neighbor and range queries against the real dataset, and checks
that brute-force, Quadtree, and K-D Tree all return identical result
sets. Run it with:

```bash
node test/verify.js
```

## Deploying to GitHub Pages (for a public link)

1. Push this repo to GitHub (see commands below).
2. On GitHub, go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and the `/ (root)` folder, then **Save**.
4. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
5. Put that link on your college dashboard, and update the "Live demo" line at the top of this README.

## License

MIT — see `LICENSE`.
