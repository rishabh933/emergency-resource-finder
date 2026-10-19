/**
 * data/resources.js
 *
 * Real emergency resource locations in Gwalior, Madhya Pradesh, India,
 * compiled from public place listings (Google Places) for this academic
 * project (Smart Emergency Resource Finder Using Quadtree & K-D Tree).
 *
 * Coverage spans City Centre, Govindpuri, DD Nagar (Deen Dayal Nagar),
 * Thatipur, Lashkar, and Morar.
 *
 * NOTE: Real-world facility locations, names, and operating status can
 * change over time. This dataset was compiled in October 2026 for
 * educational / demonstration purposes and should not be used for
 * actual emergency dispatch.
 */

window.EFR = window.EFR || {};

EFR.RESOURCE_TYPES = {
  HOSPITAL: "hospital",
  AMBULANCE: "ambulance",
  FIRE_STATION: "fireStation",
};

// Approximate geographic center of Gwalior city, used as the projection
// reference point (see js/geo.js) for converting lat/lon to planar x,y.
EFR.GWALIOR_CENTER = { lat: 26.2183, lon: 78.1828 };

EFR.RAW_RESOURCES = [
  // ---------------- Hospitals ----------------
  { id: "h01", type: "hospital", name: "ClearMedi Paridhi Multispeciality Hospital", area: "City Centre", lat: 26.2069598, lon: 78.1931418 },
  { id: "h02", type: "hospital", name: "Global Speciality Hospital", area: "Thatipur / City Centre", lat: 26.2131562, lon: 78.1922263 },
  { id: "h03", type: "hospital", name: "Sanjeevani Hospital & Research Centre", area: "City Centre", lat: 26.2129928, lon: 78.1923365 },
  { id: "h04", type: "hospital", name: "Sahara Hospital", area: "City Centre (Mahalgaon)", lat: 26.2014445, lon: 78.1878908 },
  { id: "h05", type: "hospital", name: "Arogyadham Hospital", area: "City Centre (Lashkar)", lat: 26.2035253, lon: 78.1860876 },
  { id: "h06", type: "hospital", name: "Prayaas Multi Speciality Hospital", area: "Gandhi Road, Balwant Nagar", lat: 26.2139947, lon: 78.1975781 },
  { id: "h07", type: "hospital", name: "Navyug Hospital", area: "Govindpuri", lat: 26.2065593, lon: 78.2002797 },
  { id: "h08", type: "hospital", name: "Rameshwaram Super Speciality Hospital", area: "Govindpuri", lat: 26.2065869, lon: 78.1995075 },
  { id: "h09", type: "hospital", name: "Dr Bansal Hospital", area: "Govindpuri", lat: 26.2036037, lon: 78.2035517 },
  { id: "h10", type: "hospital", name: "Josh Hospital", area: "Govindpuri / Thatipur", lat: 26.2095862, lon: 78.2004223 },
  { id: "h11", type: "hospital", name: "SKS Hospital", area: "Thatipur", lat: 26.2122627, lon: 78.1994373 },
  { id: "h12", type: "hospital", name: "Yashoda Hospital", area: "Thatipur", lat: 26.2164159, lon: 78.2137372 },
  { id: "h13", type: "hospital", name: "Vedanta Multispeciality Hospital", area: "DD Nagar", lat: 26.2635161, lon: 78.2171608 },
  { id: "h14", type: "hospital", name: "Dr. Mudgal's Sparsh Hospital", area: "DD Nagar", lat: 26.257257, lon: 78.2127496 },
  { id: "h15", type: "hospital", name: "Narayana Hospital", area: "DD Nagar", lat: 26.2667664, lon: 78.2163832 },
  { id: "h16", type: "hospital", name: "BIMR Hospitals", area: "Morar", lat: 26.2352579, lon: 78.2184329 },
  { id: "h17", type: "hospital", name: "Kalyan Memorial & KDJ Hospital", area: "Morar", lat: 26.21736, lon: 78.2221212 },
  { id: "h18", type: "hospital", name: "Shashwat Hospital", area: "Morar", lat: 26.2349288, lon: 78.208853 },
  { id: "h19", type: "hospital", name: "Agrawal Hospital and Research Institute", area: "Lashkar", lat: 26.2000429, lon: 78.1762735 },
  { id: "h20", type: "hospital", name: "RJN Apollo Spectra Hospital", area: "Lashkar", lat: 26.2198124, lon: 78.1713899 },
  { id: "h21", type: "hospital", name: "Kalyan Multispeciality Hospital", area: "Lashkar / Padav", lat: 26.2125899, lon: 78.1751477 },
  { id: "h22", type: "hospital", name: "OJAS Multispeciality Hospital", area: "Lashkar", lat: 26.1992314, lon: 78.1616611 },
  { id: "h23", type: "hospital", name: "Jaya Arogya Hospital Group (Government)", area: "Lashkar", lat: 26.1916375, lon: 78.1607183 },
  { id: "h24", type: "hospital", name: "Airforce Hospital", area: "Maharajpura", lat: 26.2841478, lon: 78.227552 },

  // ---------------- Fire Stations ----------------
  { id: "f01", type: "fireStation", name: "Fire Brigade Substation", area: "City Centre (near Roop Singh Stadium)", lat: 26.2099583, lon: 78.1828768 },
  { id: "f02", type: "fireStation", name: "Fire Brigade", area: "Maharaj Bada, Lashkar", lat: 26.1997538, lon: 78.1475334 },
  { id: "f03", type: "fireStation", name: "Fire Brigade", area: "Sheelnagar, Anand Nagar", lat: 26.2359934, lon: 78.1508572 },
  { id: "f04", type: "fireStation", name: "Air Force Station Fire Wing (approx.)", area: "Maharajpura (Airport area)", lat: 26.2976005, lon: 78.2259512 },

  // ---------------- Ambulance Services ----------------
  { id: "a01", type: "ambulance", name: "Mahaveer Ji Ambulance Service", area: "near Yashoda Hospital", lat: 26.2931433, lon: 78.1678439 },
  { id: "a02", type: "ambulance", name: "Gwalior Ambulance Service", area: "Amkhoh (1000 Bed Hospital)", lat: 26.1875158, lon: 78.1579568 },
  { id: "a03", type: "ambulance", name: "Ambulance Service", area: "Thatipur", lat: 26.2164417, lon: 78.2137855 },
  { id: "a04", type: "ambulance", name: "Tiwari Ambulance Services", area: "Lashkar (Kamla Raja Hospital)", lat: 26.1907799, lon: 78.1569672 },
  { id: "a05", type: "ambulance", name: "Katariya Ambulance Service", area: "Lashkar (Basant Vihar)", lat: 26.2069965, lon: 78.1788969 },
  { id: "a06", type: "ambulance", name: "Chambal Ambulance Service", area: "Amkhoh", lat: 26.1866124, lon: 78.1635688 },
  { id: "a07", type: "ambulance", name: "Krishna Ambulance", area: "Morar", lat: 26.2002453, lon: 78.2272299 },
  { id: "a08", type: "ambulance", name: "Baba Ambulance Service", area: "Morar", lat: 26.2328792, lon: 78.2197449 },
  { id: "a09", type: "ambulance", name: "Balaji Ambulance Service", area: "Thatipur (Birla Hospital)", lat: 26.2208223, lon: 78.2077368 },
  { id: "a10", type: "ambulance", name: "Sunil Ambulance 108", area: "Lashkar (Dabra / Roxy Pul)", lat: 26.1964964, lon: 78.1513407 },
];
