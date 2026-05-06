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
    GPS_STREAM_URL: "data/gps_stream_demo.json",
    DASHBOARD_URL: "dashboard.html",
    TIANDITU_TOKEN: "a64de21d2b50be072975188ec0cbd5eb",

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
    DEFAULT_EXTENT_PADDING: [36, 36, 36, 36],

    BASEMAP: {
      provider: "tianditu",
      style: "dark_vector",
      name: "tianditu_dark_vector_no_annotation",
      layer: "vec",
      matrixSet: "w",
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
      opacity: 0.88,
      background: "#101c1d",
      land: "#e2e9e5",
      water: "#c7dce6",
      wetland: "rgba(149, 194, 169, 0.34)",
      grassland: "rgba(208, 210, 168, 0.34)",
      relief: "rgba(198, 184, 166, 0.28)"
    }
  };
})();
