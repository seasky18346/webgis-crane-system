const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
}

function classifyPressure(windCount, powerlineLengthKm) {
  if (windCount >= 3 || powerlineLengthKm >= 50) return "高";
  if ((windCount >= 1 && windCount <= 2) || (powerlineLengthKm >= 10 && powerlineLengthKm < 50)) return "中";
  return "低";
}

function suggestionFor(level) {
  if (level === "高") {
    return "建议将该节点列为优先核查对象，重点检查缓冲区内风电场、输电线路与迁徙廊道的叠加位置。";
  }
  if (level === "中") {
    return "建议保持常规监测，优先补充设施运行季节、线路高度和鸟类通行记录。";
  }
  return "当前缓冲区内设施压力较低，可作为替代停歇或廊道连通性维护区域。";
}

function circleBuffer(point, radiusKm, steps = 72) {
  const [lon, lat] = point.coordinates;
  const coords = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (Math.PI * 2 * i) / steps;
    const dLat = (radiusKm / 111.32) * Math.sin(angle);
    const dLon = (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
    coords.push([lon + dLon, lat + dLat]);
  }
  return { type: "Polygon", coordinates: [coords] };
}

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const lat1 = a[1] * rad;
  const lat2 = b[1] * rad;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toLocalKm(coord, origin) {
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  return [
    (coord[0] - origin[0]) * 111.32 * cosLat,
    (coord[1] - origin[1]) * 111.32
  ];
}

function distancePointToSegmentKm(point, a, b) {
  const p = toLocalKm(point, point);
  const aLocal = toLocalKm(a, point);
  const bLocal = toLocalKm(b, point);
  const vx = bLocal[0] - aLocal[0];
  const vy = bLocal[1] - aLocal[1];
  const wx = p[0] - aLocal[0];
  const wy = p[1] - aLocal[1];
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(p[0] - aLocal[0], p[1] - aLocal[1]);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(p[0] - bLocal[0], p[1] - bLocal[1]);
  const t = c1 / c2;
  const proj = [aLocal[0] + t * vx, aLocal[1] + t * vy];
  return Math.hypot(p[0] - proj[0], p[1] - proj[1]);
}

function lineNearestDistanceKm(point, feature) {
  const coords = feature.geometry.coordinates;
  let nearest = Infinity;
  for (let i = 0; i < coords.length - 1; i += 1) {
    nearest = Math.min(nearest, distancePointToSegmentKm(point, coords[i], coords[i + 1]));
  }
  return nearest;
}

function lineLengthWithinRadiusKm(point, feature, radiusKm) {
  const coords = feature.geometry.coordinates;
  let length = 0;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const a = coords[i];
    const b = coords[i + 1];
    const segmentLength = haversineKm(a, b);
    const pieces = Math.max(4, Math.ceil(segmentLength / 2));
    for (let j = 0; j < pieces; j += 1) {
      const t1 = j / pieces;
      const t2 = (j + 1) / pieces;
      const tm = (t1 + t2) / 2;
      const mid = [a[0] + (b[0] - a[0]) * tm, a[1] + (b[1] - a[1]) * tm];
      if (haversineKm(point, mid) <= radiusKm) {
        length += segmentLength / pieces;
      }
    }
  }
  return length;
}

function analyzeNative(point, radiusKm) {
  const wind = readJson("wind_farms.geojson");
  const powerlines = readJson("powerlines.geojson");
  const pointCoord = point.coordinates;
  const buffer = circleBuffer(point, radiusKm);
  const windHits = wind.features.filter((feature) => haversineKm(pointCoord, feature.geometry.coordinates) <= radiusKm);
  let powerlineLengthKm = 0;
  const powerlineHits = [];
  powerlines.features.forEach((feature) => {
    const insideLength = lineLengthWithinRadiusKm(pointCoord, feature, radiusKm);
    if (insideLength > 0) {
      powerlineLengthKm += insideLength;
      powerlineHits.push(feature);
    }
  });
  const nearestWindDistanceKm = wind.features.length
    ? Math.min(...wind.features.map((feature) => haversineKm(pointCoord, feature.geometry.coordinates)))
    : null;
  const nearestPowerlineDistanceKm = powerlines.features.length
    ? Math.min(...powerlines.features.map((feature) => lineNearestDistanceKm(pointCoord, feature)))
    : null;
  const pressureLevel = classifyPressure(windHits.length, powerlineLengthKm);
  return {
    buffer,
    windCount: windHits.length,
    powerlineLengthKm,
    nearestWindDistanceKm,
    nearestPowerlineDistanceKm,
    pressureLevel,
    suggestion: suggestionFor(pressureLevel),
    affectedFeatures: [...windHits, ...powerlineHits]
  };
}

async function startExpressServer() {
  const express = require("express");
  const cors = require("cors");
  const turf = require("@turf/turf");
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.static(ROOT));

  app.post("/api/gp/node-pressure", (req, res) => {
    try {
      const { point, radiusKm } = req.body;
      const radius = Number(radiusKm) || 20;
      const pointFeature = turf.feature(point);
      const wind = readJson("wind_farms.geojson");
      const powerlines = readJson("powerlines.geojson");
      const buffer = turf.buffer(pointFeature, radius, { units: "kilometers", steps: 72 });
      const windHits = wind.features.filter((feature) => turf.booleanPointInPolygon(feature, buffer));
      let powerlineLengthKm = 0;
      const powerlineHits = [];
      powerlines.features.forEach((feature) => {
        const totalLength = turf.length(feature, { units: "kilometers" });
        const pieces = Math.max(4, Math.ceil(totalLength / 2));
        let insideLength = 0;
        for (let i = 0; i < pieces; i += 1) {
          const mid = turf.along(feature, totalLength * ((i + 0.5) / pieces), { units: "kilometers" });
          if (turf.booleanPointInPolygon(mid, buffer)) insideLength += totalLength / pieces;
        }
        if (insideLength > 0) {
          powerlineLengthKm += insideLength;
          powerlineHits.push(feature);
        }
      });
      const nearestWindDistanceKm = wind.features.length
        ? Math.min(...wind.features.map((feature) => turf.distance(pointFeature, feature, { units: "kilometers" })))
        : null;
      const nearestPowerlineDistanceKm = powerlines.features.length
        ? Math.min(...powerlines.features.map((feature) => turf.pointToLineDistance(pointFeature, feature, { units: "kilometers" })))
        : null;
      const pressureLevel = classifyPressure(windHits.length, powerlineLengthKm);
      res.json({
        buffer: buffer.geometry,
        windCount: windHits.length,
        powerlineLengthKm,
        nearestWindDistanceKm,
        nearestPowerlineDistanceKm,
        pressureLevel,
        suggestion: suggestionFor(pressureLevel),
        affectedFeatures: [...windHits, ...powerlineHits]
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Crane WebGIS GP server running at http://localhost:${PORT}`);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json;charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(body);
}

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname === "/" ? "/index.html" : parsed.pathname);
  const target = path.normalize(path.join(ROOT, pathname));
  if (!target.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(target, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(target).toLowerCase();
    const types = {
      ".html": "text/html;charset=utf-8",
      ".css": "text/css;charset=utf-8",
      ".js": "text/javascript;charset=utf-8",
      ".json": "application/json;charset=utf-8",
      ".geojson": "application/geo+json;charset=utf-8",
      ".sld": "application/xml;charset=utf-8"
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function startNativeServer() {
  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      sendJson(res, 200, {});
      return;
    }
    if (req.method === "POST" && req.url === "/api/gp/node-pressure") {
      let raw = "";
      req.on("data", (chunk) => {
        raw += chunk;
      });
      req.on("end", () => {
        try {
          const payload = JSON.parse(raw || "{}");
          const result = analyzeNative(payload.point, Number(payload.radiusKm) || 20);
          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, 400, { error: error.message });
        }
      });
      return;
    }
    if (req.method === "GET") {
      serveStatic(req, res);
      return;
    }
    sendJson(res, 405, { error: "Method not allowed" });
  });
  server.listen(PORT, () => {
    console.log(`Crane WebGIS native fallback server running at http://localhost:${PORT}`);
    console.log("Install dependencies with npm install to enable Express + Turf mode.");
  });
}

try {
  require.resolve("express");
  require.resolve("cors");
  require.resolve("@turf/turf");
  startExpressServer();
} catch (error) {
  startNativeServer();
}
