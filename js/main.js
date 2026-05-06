(function () {
  function populateNodeSelect() {
    const select = document.getElementById("gp-node-select");
    const options = window.CraneLayers.sources.migration_nodes.getFeatures()
      .map((feature) => ({
        id: feature.get("node_id"),
        name: feature.get("node_name")
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
    select.innerHTML = `<option value="">地图取点或选择节点</option>` +
      options.map((item) => `<option value="${item.id}">${item.id} ${item.name}</option>`).join("");
    select.value = "N05";
  }

  function setupLayerToggles() {
    window.CraneLayers.layerOrder.forEach((key) => {
      const checkbox = document.getElementById(`layer-${key}`);
      if (!checkbox) return;
      checkbox.addEventListener("change", () => {
        window.CraneLayers.setLayerVisible(key, checkbox.checked);
      });
    });
    document.getElementById("zoom-all").addEventListener("click", window.CraneLayers.zoomToAll);
  }

  function setupRenderControls() {
    document.getElementById("apply-render-btn").addEventListener("click", () => {
      window.CraneRenderers.updateModes({
        nodeMode: document.getElementById("node-render-select").value,
        corridorMode: document.getElementById("corridor-render-select").value,
        noteMode: document.getElementById("note-render-select").value
      });
      window.CraneLayers.refreshStyles();
      window.CraneRenderers.updateLegend();
    });
  }

  function setupPopup(map) {
    document.getElementById("popup-closer").addEventListener("click", window.CraneLayers.closePopup);
    map.on("singleclick", (event) => {
      if (window.CraneEdit.handleMapClick(event)) return;
      if (window.CraneGP.handleMapClick(event)) return;
      let picked = null;
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const layerKey = feature.get("_layerKey");
        if (layerKey && !["analysis", "affected"].includes(layerKey)) {
          picked = feature;
          return true;
        }
        return false;
      }, { hitTolerance: 6 });
      if (picked) {
        window.CraneLayers.setHighlight([picked]);
        window.CraneQuery.showPopupForFeature(picked, event.coordinate);
      } else {
        window.CraneLayers.closePopup();
      }
    });
  }

  function setModeChips() {
    document.getElementById("data-mode-chip").textContent = window.CraneConfig.USE_GEOSERVER ? "GeoServer WFS" : "本地 GeoJSON";
    document.getElementById("gp-mode-chip").textContent = window.CraneConfig.USE_WPS
      ? "GeoServer WPS"
      : (window.CraneConfig.USE_NODE_GP ? "Node GP" : "前端 Turf GP");
    document.getElementById("service-chip").textContent = window.CraneConfig.USE_GEOSERVER ? "服务模式" : "演示模式";
  }

  async function bootstrap() {
    setModeChips();
    const map = window.CraneLayers.initMap();
    await window.CraneLayers.loadAllLayers();
    populateNodeSelect();
    setupLayerToggles();
    setupRenderControls();
    window.CraneQuery.setupQueryEvents();
    window.CraneEdit.setupEditing(map);
    window.CraneGP.setupGPEvents();
    window.CraneAnimation.setupAnimationEvents();
    setupPopup(map);
    window.CraneRenderers.updateLegend();
    window.CraneLayers.zoomToAll();
    document.getElementById("query-results").innerHTML = "<p class=\"empty-note\">系统已加载，可开始查询或演示</p>";
    document.getElementById("gp-results").innerHTML = "<p class=\"empty-note\">请选择节点或地图取点后开始分析</p>";
  }

  window.addEventListener("DOMContentLoaded", () => {
    bootstrap().catch((error) => {
      document.getElementById("query-results").innerHTML = `<p class="empty-note">系统初始化失败：${error.message}</p>`;
    });
  });
})();
