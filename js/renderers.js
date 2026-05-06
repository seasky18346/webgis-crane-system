(function () {
  const state = {
    nodeMode: "risk",
    corridorMode: "cost",
    noteMode: "priority"
  };

  const riskColors = {
    "低": "#2fd2a1",
    "中": "#f0b84a",
    "高": "#ff5c35"
  };

  const priorityColors = {
    "低": "#45d483",
    "中": "#39b7ff",
    "高": "#ffd166"
  };

  function colorByCost(value) {
    const pct = Number(value) || 0;
    if (pct > 50) return "#ff5c35";
    if (pct >= 30) return "#ff8a3d";
    if (pct >= 10) return "#f0b84a";
    return "#45d483";
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
    const color = state.nodeMode === "importance" ? "#45d9ff" : (riskColors[risk] || "#2fd2a1");
    const radius = state.nodeMode === "importance" ? radiusByPagerank(feature.get("pagerank")) : 9;
    return [
      circleStyle(color, radius, "#ffffff", 2),
      new ol.style.Style({
        text: new ol.style.Text({
          text: feature.get("node_id") || "",
          offsetY: -18,
          font: "bold 12px Microsoft YaHei, sans-serif",
          fill: new ol.style.Fill({ color: "#10252a" }),
          stroke: new ol.style.Stroke({ color: "rgba(255,255,255,0.92)", width: 3 })
        })
      })
    ];
  }

  function corridorStyle(feature) {
    const color = state.corridorMode === "risk"
      ? (riskColors[feature.get("risk_level")] || "#667780")
      : colorByCost(feature.get("cost_change_pct"));
    const width = feature.get("risk_level") === "高" ? 5 : 3.5;
    return new ol.style.Style({
      stroke: new ol.style.Stroke({ color, width, lineCap: "round", lineJoin: "round" })
    });
  }

  function windStyle(feature) {
    const color = feature.get("pressure_level") === "高" ? "#9f6bff" : "#7d83ff";
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
    const color = feature.get("pressure_level") === "高" ? "#ff6b35" : "#ffb347";
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
        stroke: new ol.style.Stroke({ color: "#ff6b35", width: 8 })
      });
    }
    if (geometryType.includes("Polygon")) {
      return new ol.style.Style({
        fill: new ol.style.Fill({ color: "rgba(255, 107, 53, 0.16)" }),
        stroke: new ol.style.Stroke({ color: "#ff6b35", width: 3 })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 14,
        fill: new ol.style.Fill({ color: "rgba(255, 209, 102, 0.25)" }),
        stroke: new ol.style.Stroke({ color: "#ffd166", width: 3 })
      })
    });
  }

  function analysisStyle(feature) {
    const type = feature.getGeometry().getType();
    if (type.includes("Polygon")) {
      return new ol.style.Style({
        fill: new ol.style.Fill({ color: "rgba(69, 217, 255, 0.12)" }),
        stroke: new ol.style.Stroke({ color: "#45d9ff", width: 2, lineDash: [8, 5] })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: "#45d9ff" }),
        stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 })
      })
    });
  }

  function affectedStyle(feature) {
    const type = feature.getGeometry().getType();
    if (type.includes("Line")) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: "#ff6b35", width: 6 })
      });
    }
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12,
        fill: new ol.style.Fill({ color: "rgba(255, 107, 53, 0.24)" }),
        stroke: new ol.style.Stroke({ color: "#ff6b35", width: 3 })
      })
    });
  }

  function gpsStyle(feature) {
    const high = feature.get("risk_level") === "高";
    return [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: high ? 18 : 15,
          fill: new ol.style.Fill({ color: high ? "rgba(255, 92, 53, 0.22)" : "rgba(69, 217, 255, 0.22)" }),
          stroke: new ol.style.Stroke({ color: high ? "#ff5c35" : "#45d9ff", width: 2 })
        })
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({ color: "#ffffff" }),
          stroke: new ol.style.Stroke({ color: high ? "#ff5c35" : "#2fd2a1", width: 3 })
        }),
        text: new ol.style.Text({
          text: "模拟 GPS",
          offsetY: -24,
          font: "bold 12px Microsoft YaHei, sans-serif",
          fill: new ol.style.Fill({ color: "#0d1d21" }),
          stroke: new ol.style.Stroke({ color: "rgba(255,255,255,0.9)", width: 3 })
        })
      })
    ];
  }

  function styleForLayer(key) {
    if (key === "migration_nodes") return nodeStyle;
    if (key === "migration_corridors") return corridorStyle;
    if (key === "wind_farms") return windStyle;
    if (key === "powerlines") return powerlineStyle;
    if (key === "conservation_notes") return noteStyle;
    if (key === "analysis") return analysisStyle;
    if (key === "affected") return affectedStyle;
    if (key === "gps") return gpsStyle;
    return circleStyle("#1769aa", 8);
  }

  function updateModes(next) {
    Object.assign(state, next);
  }

  function updateLegend() {
    const legend = document.getElementById("legend");
    if (!legend) return;
    legend.innerHTML = `
      <div class="legend-row"><span class="legend-symbol" style="background:#2fd2a1"></span><span>低风险 / 低优先级 / 0-10%</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#f0b84a"></span><span>中风险 / 10-30%</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#ff8a3d"></span><span>30-50% 成本增加</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#ff5c35"></span><span>高风险 / 高优先级 / &gt;50%</span></div>
      <div class="legend-row"><span class="legend-line" style="color:#ffb347"></span><span>虚线：输电线路</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#9f6bff"></span><span>三角形：风电设施</span></div>
      <div class="legend-row"><span class="legend-symbol" style="background:#45d9ff"></span><span>模拟 GPS / GP 分析范围</span></div>
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
