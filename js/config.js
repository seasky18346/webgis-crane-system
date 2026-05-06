(function () {
  window.CraneConfig = {
    USE_GEOSERVER: false,
    USE_WPS: false,
    USE_NODE_GP: false,

    GEOSERVER_BASE_URL: "http://localhost:8080/geoserver",
    GEOSERVER_WORKSPACE: "crane_webgis",
    WMS_URL: "http://localhost:8080/geoserver/crane_webgis/wms",
    WFS_URL: "http://localhost:8080/geoserver/crane_webgis/ows",
    WPS_URL: "http://localhost:8080/geoserver/ows",
    NODE_GP_URL: "http://localhost:3000/api/gp/node-pressure",

    LAYER_NAMES: {
      migration_nodes: "migration_nodes",
      migration_corridors: "migration_corridors",
      wind_farms: "wind_farms",
      powerlines: "powerlines",
      conservation_notes: "conservation_notes"
    },

    LOCAL_DATA_URLS: {
      migration_nodes: "data/migration_nodes.geojson",
      migration_corridors: "data/migration_corridors.geojson",
      wind_farms: "data/wind_farms.geojson",
      powerlines: "data/powerlines.geojson",
      conservation_notes: "data/conservation_notes.geojson"
    },

    DEFAULT_CENTER: [119.2, 43.8],
    DEFAULT_ZOOM: 4.2,
    DEFAULT_EXTENT_PADDING: [36, 36, 36, 36]
  };
})();
