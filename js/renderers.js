(function () {
  const state = {
    nodeMode: "risk",
    corridorMode: "cost",
    noteMode: "priority"
  };

  const riskColors = {
    "低": "#2e7d32",
    "中": "#d79217",
    "高": "#c62828"
  };

  const priorityColors = {
    "低": "#2e7d32",
    "中": "#1769aa",
    "高": "#c62828"
  };

  function colorByCost(value) {
    const pct = Number(value) || 0;
    if (pct > 50) return "#c62828";
    if (pct >= 30) return "#ef6c00";
    if (pct >= 10) return "#d79217";
    return "#2e7d32";
  }

  function radiusByPagerank(value) {
    const score = Number(value) || 0;
    return Math.max(7, Math.min(18, 7 + score * 45));
  }

  function circleStyle(color, radius, strokeColor, strokeWidth) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius,
        fill: new ol.style.Fill({ color }),
        stroke: new ol.style.Stroke({ color: strokeColor || "#ffffff", width: strokeWidth || 2 })
      })
    });
  }

  function nodeStyle(feature) {
    const risk = feature.get("risk_level");
    const color = state.nodeMode === "importance" ? "#1769aa" : (riskColors[risk] || "#667780");
    const radius = state.nodeMode === "importance" ? radiusByPagerank(feature.get("pagerank")) : 9;
    return [
      circleStyle(color, radius, "#ffffff", 2),
      new ol.style.Style({
        text: new ol.style.Text({
          text: feature.get("node_id") || "",
          offsetY: -18,
          font: "bold 12px Microsoft YaHei, sans-serif",
          fill: new ol.style.Fill({ color: "#17303d" }),
          stroke: new ol.style.Stroke({ color: "#ffffff", width: 3 })
        })
      })
    ];
  }

  function corridorStyle(feature) {
    const color = state.corridorMode === "risk"
      ? (riskColors[feature.get("risk_level")] || "#667780")
      : colorByCost(feature.get("cost_change_pct"));
    const width = feature.get("risk_level") === "高" ? 4 : 3;
    return new ol.style.Style({
      stroke: new ol.style.Stroke({ color, width, lineCap: "round", lineJoin: "round" })
    });
  }

  function windStyle(feature) {
    const color = riskColors[feature.get("pressure_level")] || "#6c4ab6";
    return new ol.style.Style({
      image: new ol.style.RegularShape({
        points: 3,
        radius: 10,
        rotation: Math.PI / 6,
        fill: new ol.style.Fill({ color }),
        stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 })
      })
    });
  }

  function powerlineStyle(feature) {
    const color = riskColors[feature.get("pressure_level")] || "#455a64";
    return new ol.style.Style({
      stroke: new ol.style.Stroke({ color, width: 3, lineDash: [10, 6] })
    });
  }

  function noteStyle(feature) {
    const color = priorityColors[feature.get("priority")] || "#1769aa";
    return [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 8,
          fill: new ol.style.Fill({ color }),
          stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 })
        })
      }),
      new ol.style.Style({
        image: new ol.style.RegularShape({
          points: 4,
          radius: 13,
          radius2: 4,
          fill: new ol.style.Fill({ color: "rgba(255,255,255,0)" }),
          stroke: new ol.style.Stroke({ color, width: 2 })
        })
      })
    ];
  }

  function highlightStyle(feature) {
    const geometryType = feature.getGeometry().getType();
    if (geometryType.includes("Line")) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: "#00a7c7", width: 7 })
      });
    }
    if (geometryType.includes("Polygon")) {
      return new ol.style.Style({
        fill: new ol.style.Fill({ color: "rgba(0, 167, 199, 0.14)" }),
        stroke: new ol.style.Stroke({ color: "#00a7c7", width: 3 })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 14,
        fill: new ol.style.Fill({ color: "rgba(0, 167, 199, 0.2)" }),
        stroke: new ol.style.Stroke({ color: "#00a7c7", width: 3 })
      })
    });
  }

  function analysisStyle(feature) {
    const type = feature.getGeometry().getType();
    if (type.includes("Polygon")) {
      return new ol.style.Style({
        fill: new ol.style.Fill({ color: "rgba(23, 105, 170, 0.12)" }),
        stroke: new ol.style.Stroke({ color: "#1769aa", width: 2, lineDash: [8, 5] })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: "#1769aa" }),
        stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 })
      })
    });
  }

  function affectedStyle(feature) {
    const type = feature.getGeometry().getType();
    if (type.includes("Line")) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: "#ff4d00", width: 6 })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12,
        fill: new ol.style.Fill({ color: "rgba(255, 77, 0, 0.24)" }),
        stroke: new ol.style.Stroke({ color: "#ff4d00", width: 3 })
      })
    });
  }

  function styleForLayer(key) {
    if (key === "migration_nodes") return nodeStyle;
    if (key === "migration_corridors") return corridorStyle;
    if (key === "wind_farms") return windStyle;
    if (key === "powerlines") return powerlineStyle;
    if (key === "conservation_notes") return noteStyle;
    if (key === "analysis") return analysisStyle;
    if (key === "affected") return affectedStyle;
    return circleStyle("#1769aa", 8);
  }

  function updateModes(next) {
    Object.assign(state, next);
  }

  function updateLegend() {
    const legend = document.getElementById("legend");
    if (!legend) return;
    legend.innerHTML = `
      <div class="legend-row"><span class="legend-symbol" style="background:#2e7d32"></span><span>低风险 / 低优先级 / 0-10%</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#d79217"></span><span>中风险 / 10-30%</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#ef6c00"></span><span>30-50% 成本增加</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#c62828"></span><span>高风险 / 高优先级 / &gt;50%</span></div>
      <div class="legend-row"><span class="legend-line" style="color:#455a64"></span><span>虚线：输电线路</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#1769aa"></span><span>蓝色缓冲区：GP 分析范围</span></div>
    `;
  }

  window.CraneRenderers = {
    updateModes,
    updateLegend,
    styleForLayer,
    highlightStyle,
    riskColors,
    priorityColors,
    colorByCost
  };
})();
