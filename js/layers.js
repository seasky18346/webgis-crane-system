(function () {
  const cfg = window.CraneConfig;
  const format = new ol.format.GeoJSON();
  const sources = {};
  const layers = {};
  let map;
  let popupOverlay;
  let gpsFeature;

  const layerOrder = [
    "migration_corridors",
    "powerlines",
    "wind_farms",
    "migration_nodes",
    "conservation_notes"
  ];

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function setAppStatus(message) {
    const details = document.getElementById("feature-details");
    if (details && !details.dataset.locked) {
      details.innerHTML = `<p class="empty-note">${message}</p>`;
    }
  }

  function makeWfsUrl(key) {
    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: `${cfg.GEOSERVER_WORKSPACE}:${cfg.LAYER_NAMES[key]}`,
      outputFormat: "application/json",
      srsName: "EPSG:4326"
    });
    return `${cfg.WFS_URL}?${params.toString()}`;
  }

  async function readGeoJson(key) {
    const url = cfg.USE_GEOSERVER ? makeWfsUrl(key) : cfg.LOCAL_DATA_URLS[key];
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      const fallback = window.CraneEmbeddedData && window.CraneEmbeddedData[key];
      if (!fallback) throw error;
      setAppStatus(`已使用内置演示数据：${key}`);
      return cloneJson(fallback);
    }
  }

  function createVector(key, zIndex) {
    sources[key] = new ol.source.Vector();
    layers[key] = new ol.layer.Vector({
      source: sources[key],
      style: window.CraneRenderers.styleForLayer(key),
      zIndex
    });
  }

  function featureFromLonLat(geometry, properties) {
    return format.readFeature({
      type: "Feature",
      properties: properties || {},
      geometry
    }, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });
  }

  function createCleanBasemapLayer() {
    const base = cfg.BASEMAP || {};
    const basemapSource = new ol.source.Vector({
      features: [
        featureFromLonLat({
          type: "Polygon",
          coordinates: [[[103, 24], [134, 24], [134, 53.5], [103, 53.5], [103, 24]]]
        }, { base_type: "land" }),
        featureFromLonLat({
          type: "Polygon",
          coordinates: [[[116.6, 34.4], [119.4, 35.6], [121.3, 37.3], [122.5, 39.4], [121.4, 40.5], [119.4, 40.1], [118.1, 38.8], [116.8, 37.1], [116.6, 34.4]]]
        }, { base_type: "water" }),
        featureFromLonLat({
          type: "Polygon",
          coordinates: [[[120.1, 40.4], [121.9, 41.3], [123.4, 43.1], [123.9, 45.2], [122.6, 46.4], [120.6, 45.6], [119.6, 43.4], [119.4, 41.7], [120.1, 40.4]]]
        }, { base_type: "grassland" }),
        featureFromLonLat({
          type: "Polygon",
          coordinates: [[[113.2, 42.2], [117.4, 42.1], [119.6, 44.1], [117.9, 46.4], [113.7, 47.8], [111.4, 46.1], [112.0, 43.6], [113.2, 42.2]]]
        }, { base_type: "wetland" }),
        featureFromLonLat({
          type: "Polygon",
          coordinates: [[[117.6, 39.2], [121.8, 40.2], [124.1, 42.6], [122.7, 44.2], [119.2, 43.1], [116.4, 40.9], [117.6, 39.2]]]
        }, { base_type: "relief" })
      ]
    });
    const fills = {
      land: base.land || "#e2e9e5",
      water: base.water || "#c7dce6",
      wetland: base.wetland || "rgba(149, 194, 169, 0.34)",
      grassland: base.grassland || "rgba(208, 210, 168, 0.34)",
      relief: base.relief || "rgba(198, 184, 166, 0.28)"
    };
    return new ol.layer.Vector({
      source: basemapSource,
      style(feature) {
        return new ol.style.Style({
          fill: new ol.style.Fill({ color: fills[feature.get("base_type")] || fills.land })
        });
      },
      zIndex: 0,
      properties: {
        basemapName: base.name || "clean_ecological_context"
      }
    });
  }

  function createTianDiTuBasemapLayer() {
    const base = cfg.BASEMAP || {};
    if (base.provider !== "tianditu" || !cfg.TIANDITU_TOKEN) return null;
    const subdomains = base.subdomains && base.subdomains.length ? base.subdomains : ["0"];
    const layer = base.layer || "vec";
    const matrixSet = base.matrixSet || "w";
    const urls = subdomains.map((id) => (
      `https://t${id}.tianditu.gov.cn/${layer}_${matrixSet}/wmts?` +
      "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
      `&LAYER=${layer}&STYLE=default&TILEMATRIXSET=${matrixSet}` +
      "&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
      `&tk=${cfg.TIANDITU_TOKEN}`
    ));
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        urls,
        crossOrigin: "anonymous",
        maxZoom: 18
      }),
      opacity: Number(base.opacity) || 0.9,
      className: base.style === "dark_vector" ? "tdt-dark-basemap" : "tdt-basemap",
      zIndex: 1,
      properties: {
        basemapName: base.name || "tianditu_vector"
      }
    });
  }

  function initMap(options) {
    const initOptions = typeof options === "string" ? { target: options } : (options || {});
    const target = initOptions.target || "map";
    const includeControls = initOptions.controls !== false;
    createVector("migration_corridors", 20);
    createVector("powerlines", 30);
    createVector("wind_farms", 40);
    createVector("migration_nodes", 50);
    createVector("conservation_notes", 60);
    createVector("analysis", 70);
    createVector("affected", 80);
    createVector("gps", 95);
    sources.highlight = new ol.source.Vector();
    layers.highlight = new ol.layer.Vector({
      source: sources.highlight,
      style: window.CraneRenderers.highlightStyle,
      zIndex: 90
    });

    const basemapLayers = [
      createCleanBasemapLayer(),
      createTianDiTuBasemapLayer()
    ].filter(Boolean);

    map = new ol.Map({
      target,
      layers: [
        ...basemapLayers,
        ...layerOrder.map((key) => layers[key]),
        layers.analysis,
        layers.affected,
        layers.gps,
        layers.highlight
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(cfg.DEFAULT_CENTER),
        zoom: cfg.DEFAULT_ZOOM
      }),
      controls: includeControls
        ? ol.control.defaults.defaults().extend([
          new ol.control.ScaleLine({ units: "metric" }),
          new ol.control.FullScreen()
        ])
        : []
    });

    const popupElement = document.getElementById("map-popup");
    if (popupElement) {
      popupOverlay = new ol.Overlay({
        element: popupElement,
        autoPan: { animation: { duration: 180 } }
      });
      map.addOverlay(popupOverlay);
      closePopup();
    }
    return map;
  }

  async function loadLayer(key) {
    const geojson = await readGeoJson(key);
    const features = format.readFeatures(geojson, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });
    features.forEach((feature) => feature.set("_layerKey", key, true));
    sources[key].clear();
    sources[key].addFeatures(features);
    return features;
  }

  async function loadAllLayers() {
    const loaded = {};
    for (const key of layerOrder) {
      loaded[key] = await loadLayer(key);
    }
    return loaded;
  }

  function refreshStyles() {
    Object.keys(layers).forEach((key) => {
      if (layers[key] && layers[key].changed) layers[key].changed();
    });
  }

  function setLayerVisible(key, visible) {
    if (layers[key]) layers[key].setVisible(visible);
  }

  function setHighlight(features) {
    sources.highlight.clear();
    const clones = features.map((feature) => {
      const clone = feature.clone();
      clone.set("_layerKey", feature.get("_layerKey"), true);
      return clone;
    });
    sources.highlight.addFeatures(clones);
  }

  function clearHighlight() {
    sources.highlight.clear();
  }

  function clearAnalysis() {
    sources.analysis.clear();
    sources.affected.clear();
  }

  function setGpsPoint(point) {
    const lon = Number(point && point.lon);
    const lat = Number(point && point.lat);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
    const coordinate = ol.proj.fromLonLat([lon, lat]);
    if (!gpsFeature) {
      gpsFeature = new ol.Feature({
        geometry: new ol.geom.Point(coordinate)
      });
      gpsFeature.set("_layerKey", "gps", true);
      sources.gps.addFeature(gpsFeature);
    } else {
      gpsFeature.getGeometry().setCoordinates(coordinate);
    }
    gpsFeature.setProperties({
      bird_id: point.bird_id,
      timestamp: point.timestamp,
      near_node: point.near_node,
      corridor_id: point.corridor_id,
      risk_level: point.risk_level,
      message: point.message,
      _layerKey: "gps"
    }, true);
    return gpsFeature;
  }

  function clearGpsPoint() {
    gpsFeature = null;
    if (sources.gps) sources.gps.clear();
  }

  function showAnalysis(bufferGeoJson, affectedGeoJsonFeatures, pointGeoJson) {
    clearAnalysis();
    if (bufferGeoJson) {
      const bufferObject = bufferGeoJson.type === "Feature"
        ? bufferGeoJson
        : { type: "Feature", properties: {}, geometry: bufferGeoJson };
      const bufferFeature = format.readFeature(bufferObject, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });
      sources.analysis.addFeature(bufferFeature);
    }
    if (pointGeoJson) {
      const pointFeature = format.readFeature(pointGeoJson, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });
      sources.analysis.addFeature(pointFeature);
    }
    if (affectedGeoJsonFeatures && affectedGeoJsonFeatures.length) {
      const affected = format.readFeatures({
        type: "FeatureCollection",
        features: affectedGeoJsonFeatures
      }, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });
      sources.affected.addFeatures(affected);
    }
  }

  function zoomToFeatures(features) {
    if (!features || !features.length) return;
    const extent = ol.extent.createEmpty();
    features.forEach((feature) => ol.extent.extend(extent, feature.getGeometry().getExtent()));
    if (!ol.extent.isEmpty(extent)) {
      map.getView().fit(extent, {
        padding: cfg.DEFAULT_EXTENT_PADDING,
        duration: 350,
        maxZoom: 8
      });
    }
  }

  function zoomToAll() {
    const allFeatures = layerOrder.flatMap((key) => sources[key].getFeatures());
    zoomToFeatures(allFeatures);
  }

  function featureToGeoJson(feature) {
    return JSON.parse(format.writeFeature(feature, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    }));
  }

  function getCollectionGeoJSON(key) {
    return JSON.parse(format.writeFeatures(sources[key].getFeatures(), {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    }));
  }

  function showPopup(coordinate, html) {
    document.getElementById("popup-content").innerHTML = html;
    popupOverlay.setPosition(coordinate);
  }

  function closePopup() {
    if (popupOverlay) popupOverlay.setPosition(undefined);
  }

  window.CraneLayers = {
    initMap,
    loadAllLayers,
    refreshStyles,
    setLayerVisible,
    setHighlight,
    clearHighlight,
    clearAnalysis,
    setGpsPoint,
    clearGpsPoint,
    showAnalysis,
    zoomToFeatures,
    zoomToAll,
    featureToGeoJson,
    getCollectionGeoJSON,
    showPopup,
    closePopup,
    sources,
    layers,
    get map() {
      return map;
    },
    layerOrder
  };
})();
