(function () {
  function prop(feature, key) {
    const value = feature.get(key);
    return value === undefined || value === null ? "" : String(value);
  }

  function featureTitle(feature) {
    const key = feature.get("_layerKey");
    if (key === "migration_nodes") {
      return `${prop(feature, "node_id")} ${prop(feature, "node_name")}`;
    }
    if (key === "migration_corridors") {
      return `${prop(feature, "edge_id")} ${prop(feature, "from_node")} → ${prop(feature, "to_node")}`;
    }
    if (key === "conservation_notes") {
      return `${prop(feature, "note_id")} ${prop(feature, "name")}`;
    }
    return prop(feature, "name") || prop(feature, "infra_id") || "要素";
  }

  function featureSubTitle(feature) {
    const key = feature.get("_layerKey");
    if (key === "migration_nodes") {
      return `${prop(feature, "node_type")}｜风险：${prop(feature, "risk_level")}｜停歇：${prop(feature, "stopover_count")}`;
    }
    if (key === "migration_corridors") {
      return `${prop(feature, "corridor_type")}｜成本增加：${prop(feature, "cost_change_pct")}%｜风险：${prop(feature, "risk_level")}`;
    }
    if (key === "conservation_notes") {
      return `${prop(feature, "note_type")}｜优先级：${prop(feature, "priority")}`;
    }
    return `${prop(feature, "infra_type") || "基础设施"}｜压力：${prop(feature, "pressure_level")}`;
  }

  function renderResults(features, label) {
    const container = document.getElementById("query-results");
    if (!container) return;
    if (!features.length) {
      container.innerHTML = `<p class="empty-note">${label}：0 条结果</p>`;
      window.CraneLayers.clearHighlight();
      return;
    }
    container.innerHTML = features.map((feature, index) => `
      <button class="result-item" type="button" data-result-index="${index}">
        <strong>${featureTitle(feature)}</strong>
        <span>${featureSubTitle(feature)}</span>
      </button>
    `).join("");
    container.querySelectorAll("[data-result-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const feature = features[Number(button.dataset.resultIndex)];
        window.CraneLayers.setHighlight([feature]);
        window.CraneLayers.zoomToFeatures([feature]);
        window.CraneQuery.showFeatureDetails(feature);
      });
    });
    window.CraneLayers.setHighlight(features);
    window.CraneLayers.zoomToFeatures(features);
  }

  function runNodeQuery() {
    const nodeId = document.getElementById("node-id-input").value.trim().toUpperCase();
    const nodeType = document.getElementById("node-type-select").value;
    const risk = document.getElementById("node-risk-select").value;
    const features = window.CraneLayers.sources.migration_nodes.getFeatures().filter((feature) => {
      const matchId = !nodeId || prop(feature, "node_id").toUpperCase().includes(nodeId);
      const matchType = !nodeType || prop(feature, "node_type") === nodeType;
      const matchRisk = !risk || prop(feature, "risk_level") === risk;
      return matchId && matchType && matchRisk;
    });
    renderResults(features, "节点查询");
  }

  function runCorridorQuery(onlyHighRisk) {
    const edgeId = document.getElementById("corridor-edge-input").value.trim().toUpperCase();
    const thresholdValue = document.getElementById("corridor-threshold-input").value;
    const threshold = thresholdValue === "" ? null : Number(thresholdValue);
    const features = window.CraneLayers.sources.migration_corridors.getFeatures().filter((feature) => {
      const matchId = !edgeId || prop(feature, "edge_id").toUpperCase().includes(edgeId);
      const matchRisk = !onlyHighRisk || prop(feature, "risk_level") === "高" || prop(feature, "corridor_type") === "高风险廊道";
      const matchThreshold = threshold === null || Number(feature.get("cost_change_pct")) > threshold;
      return matchId && matchRisk && matchThreshold;
    });
    renderResults(features, onlyHighRisk ? "高风险廊道" : "廊道查询");
  }

  function runNoteQuery() {
    const priority = document.getElementById("note-priority-select").value;
    const features = window.CraneLayers.sources.conservation_notes.getFeatures().filter((feature) => {
      return !priority || prop(feature, "priority") === priority;
    });
    renderResults(features, "保护建议查询");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#039;");
  }

  function detailsTable(feature) {
    const properties = feature.getProperties();
    return `
      <table class="attr-table">
        <tbody>
          ${Object.entries(properties)
            .filter(([key, value]) => key !== "geometry" && !key.startsWith("_") && value !== undefined)
            .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `;
  }

  function showFeatureDetails(feature) {
    const details = document.getElementById("feature-details");
    if (details) {
      details.dataset.locked = "true";
      details.innerHTML = detailsTable(feature);
    }
  }

  function showPopupForFeature(feature, coordinate) {
    showFeatureDetails(feature);
    window.CraneLayers.showPopup(coordinate, `
      <h3 style="margin:0 26px 8px 0;font-size:15px">${escapeHtml(featureTitle(feature))}</h3>
      ${detailsTable(feature)}
    `);
  }

  function setupQueryEvents() {
    document.getElementById("node-query-btn").addEventListener("click", runNodeQuery);
    document.getElementById("corridor-query-btn").addEventListener("click", () => runCorridorQuery(false));
    document.getElementById("corridor-risk-btn").addEventListener("click", () => runCorridorQuery(true));
    document.getElementById("note-query-btn").addEventListener("click", runNoteQuery);
    document.getElementById("clear-highlight-btn").addEventListener("click", () => {
      window.CraneLayers.clearHighlight();
      renderResults([], "已清除");
    });
  }

  window.CraneQuery = {
    setupQueryEvents,
    runNodeQuery,
    runCorridorQuery,
    runNoteQuery,
    renderResults,
    showFeatureDetails,
    showPopupForFeature,
    featureTitle,
    featureSubTitle
  };
})();
