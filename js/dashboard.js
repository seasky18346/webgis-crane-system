(function () {
  function features(key) {
    return window.CraneLayers.sources[key].getFeatures();
  }

  function countBy(items, field) {
    return items.reduce((acc, feature) => {
      const value = feature.get(field) || "未分级";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function powerlineLengthKm() {
    const collection = window.CraneLayers.getCollectionGeoJSON("powerlines");
    return collection.features.reduce((sum, feature) => sum + turf.length(feature, { units: "kilometers" }), 0);
  }

  function highRiskCorridors() {
    return features("migration_corridors")
      .filter((feature) => feature.get("risk_level") === "高" || feature.get("corridor_type") === "高风险廊道");
  }

  function costBuckets() {
    const buckets = {
      "基本稳定": 0,
      "轻度受影响": 0,
      "中度受影响": 0,
      "高度受影响": 0
    };
    features("migration_corridors").forEach((feature) => {
      const pct = Number(feature.get("cost_change_pct")) || 0;
      if (pct <= 10) buckets["基本稳定"] += 1;
      else if (pct <= 30) buckets["轻度受影响"] += 1;
      else if (pct <= 50) buckets["中度受影响"] += 1;
      else buckets["高度受影响"] += 1;
    });
    return buckets;
  }

  function metricHtml(label, value) {
    return `<div class="dash-metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function renderMetrics() {
    const length = powerlineLengthKm();
    const metrics = [
      ["迁徙节点数", features("migration_nodes").length],
      ["迁徙廊道数", features("migration_corridors").length],
      ["高风险廊道数", highRiskCorridors().length],
      ["风电设施数", features("wind_farms").length],
      ["输电线路长度", `${length.toFixed(1)} km`],
      ["保护建议点数", features("conservation_notes").length]
    ];
    document.getElementById("dashboard-metrics").innerHTML = metrics
      .map(([label, value]) => metricHtml(label, value))
      .join("");
  }

  function renderBars(containerId, rows) {
    const max = Math.max(1, ...Object.values(rows));
    document.getElementById(containerId).innerHTML = Object.entries(rows)
      .map(([label, value]) => {
        const width = Math.max(4, (value / max) * 100);
        return `
          <div class="bar-row">
            <span>${label}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
            <strong>${value}</strong>
          </div>
        `;
      })
      .join("");
  }

  function readLastGP() {
    try {
      return JSON.parse(window.localStorage.getItem("crane_last_gp_result") || "null");
    } catch (error) {
      return null;
    }
  }

  function renderPressureOverview() {
    const last = readLastGP();
    const length = powerlineLengthKm();
    const rows = [
      ["风电场数量", `${features("wind_farms").length}`],
      ["输电线路总长度", `${length.toFixed(1)} km`],
      ["最近一次 GP 分析压力等级", last ? last.pressureLevel : "暂无"],
      ["最近一次分析半径", last ? `${Number(last.radiusKm).toFixed(0)} km` : "暂无"]
    ];
    document.getElementById("pressure-overview").innerHTML = rows
      .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
  }

  function renderDashboard() {
    renderMetrics();
    renderBars("risk-bars", {
      "低风险节点数": countBy(features("migration_nodes"), "risk_level").低 || 0,
      "中风险节点数": countBy(features("migration_nodes"), "risk_level").中 || 0,
      "高风险节点数": countBy(features("migration_nodes"), "risk_level").高 || 0
    });
    renderBars("cost-bars", costBuckets());
    renderPressureOverview();
  }

  function setupCollapsiblePanels() {
    document.querySelectorAll(".dashboard-card").forEach((panel) => {
      const title = panel.querySelector("h2");
      if (!title || title.querySelector(".collapse-toggle")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collapse-toggle";
      button.textContent = "收起";
      button.addEventListener("click", () => {
        panel.classList.toggle("is-collapsed");
        button.textContent = panel.classList.contains("is-collapsed") ? "展开" : "收起";
      });
      title.appendChild(button);
    });
  }

  async function bootstrap() {
    const map = window.CraneLayers.initMap({ target: "dashboard-map", controls: false });
    await window.CraneLayers.loadAllLayers();
    window.CraneLayers.setLayerVisible("wind_farms", false);
    window.CraneLayers.setLayerVisible("powerlines", false);
    window.CraneLayers.setLayerVisible("conservation_notes", false);
    renderDashboard();
    setupCollapsiblePanels();
    window.CraneLayers.zoomToAll();
    window.CraneLayers.setHighlight(highRiskCorridors());
    window.CraneGPSReplay.setupControls();
    document.getElementById("dashboard-back-btn").addEventListener("click", () => {
      window.location.href = "index.html";
    });
    window.setTimeout(() => {
      window.CraneGPSReplay.start({ reset: true, interval: 1500 });
    }, 700);
    map.updateSize();
  }

  window.addEventListener("DOMContentLoaded", () => {
    bootstrap().catch((error) => {
      document.getElementById("dashboard-metrics").innerHTML =
        `<p class="empty-note">大屏初始化失败：${error.message}</p>`;
    });
  });
})();
