(function () {
  const cfg = window.CraneConfig;
  const format = new ol.format.GeoJSON();
  const sources = {};
  const layers = {};
  let map;
  let popupOverlay;

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

  function initMap() {
    createVector("migration_corridors", 20);
    createVector("powerlines", 30);
    createVector("wind_farms", 40);
    createVector("migration_nodes", 50);
    createVector("conservation_notes", 60);
    createVector("analysis", 70);
    createVector("affected", 80);
    sources.highlight = new ol.source.Vector();
    layers.highlight = new ol.layer.Vector({
      source: sources.highlight,
      style: window.CraneRenderers.highlightStyle,
      zIndex: 90
    });

    map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0
        }),
        ...layerOrder.map((key) => layers[key]),
        layers.analysis,
        layers.affected,
        layers.highlight
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(cfg.DEFAULT_CENTER),
        zoom: cfg.DEFAULT_ZOOM
      }),
      controls: ol.control.defaults.defaults().extend([
        new ol.control.ScaleLine({ units: "metric" }),
        new ol.control.FullScreen()
      ])
    });

    popupOverlay = new ol.Overlay({
      element: document.getElementById("map-popup"),
      autoPan: { animation: { duration: 180 } }
    });
    map.addOverlay(popupOverlay);
    closePopup();
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
