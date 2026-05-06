(function () {
  let pickingMapPoint = false;
  let selectedPoint = null;

  function setStatus(message) {
    document.getElementById("gp-status").textContent = message;
  }

  function pointFromNodeSelection() {
    const nodeId = document.getElementById("gp-node-select").value;
    if (!nodeId) return null;
    const feature = window.CraneLayers.sources.migration_nodes.getFeatures()
      .find((item) => item.get("node_id") === nodeId);
    if (!feature) return null;
    return window.CraneLayers.featureToGeoJson(feature).geometry;
  }

  function getInputPoint() {
    return pointFromNodeSelection() || selectedPoint;
  }

  function formatKm(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "无";
    return `${Number(value).toFixed(2)} km`;
  }

  function pressureClass(level) {
    if (level === "高") return "pressure-high";
    if (level === "中") return "pressure-mid";
    return "pressure-low";
  }

  function renderResult(result) {
    const output = document.getElementById("gp-results");
    output.innerHTML = `
      <div class="metric-grid">
        <div class="metric"><span>风电场数量</span><strong>${result.windCount}</strong></div>
        <div class="metric"><span>输电线路长度</span><strong>${Number(result.powerlineLengthKm).toFixed(2)} km</strong></div>
        <div class="metric"><span>最近风电场</span><strong>${formatKm(result.nearestWindDistanceKm)}</strong></div>
        <div class="metric"><span>最近输电线路</span><strong>${formatKm(result.nearestPowerlineDistanceKm)}</strong></div>
        <div class="metric ${pressureClass(result.pressureLevel)}"><span>综合压力</span><strong>${result.pressureLevel}</strong></div>
        <div class="metric"><span>分析半径</span><strong>${Number(result.radiusKm).toFixed(0)} km</strong></div>
      </div>
      <p style="margin:10px 0 0;line-height:1.6">${result.suggestion}</p>
    `;
  }

  function saveLastResult(result) {
    try {
      window.localStorage.setItem("crane_last_gp_result", JSON.stringify({
        pressureLevel: result.pressureLevel,
        radiusKm: result.radiusKm,
        windCount: result.windCount,
        powerlineLengthKm: result.powerlineLengthKm,
        analyzedAt: new Date().toISOString()
      }));
    } catch (error) {
      // localStorage is optional for the dashboard overview.
    }
  }

  function currentInfraCollections() {
    return {
      wind: window.CraneLayers.getCollectionGeoJSON("wind_farms"),
      powerlines: window.CraneLayers.getCollectionGeoJSON("powerlines")
    };
  }

  function approximateLineLengthInsideBuffer(lineFeature, bufferFeature) {
    const totalLength = turf.length(lineFeature, { units: "kilometers" });
    if (!totalLength) return 0;
    const pieces = Math.max(4, Math.ceil(totalLength / 2));
    let lengthInside = 0;
    for (let i = 0; i < pieces; i += 1) {
      const start = totalLength * (i / pieces);
      const end = totalLength * ((i + 1) / pieces);
      const mid = totalLength * ((i + 0.5) / pieces);
      const midPoint = turf.along(lineFeature, mid, { units: "kilometers" });
      if (turf.booleanPointInPolygon(midPoint, bufferFeature)) {
        lengthInside += end - start;
      }
    }
    return lengthInside;
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

  async function executeFrontendGPAnalysis(pointGeometry, radiusKm) {
    const { wind, powerlines } = currentInfraCollections();
    const point = turf.feature(pointGeometry);
    const buffer = turf.buffer(point, radiusKm, { units: "kilometers", steps: 72 });
    const windHits = wind.features.filter((feature) => turf.booleanPointInPolygon(feature, buffer));
    let powerlineLengthKm = 0;
    const powerlineHits = [];
    powerlines.features.forEach((feature) => {
      const lengthInside = approximateLineLengthInsideBuffer(feature, buffer);
      if (lengthInside > 0) {
        powerlineLengthKm += lengthInside;
        powerlineHits.push(feature);
      }
    });
    const nearestWindDistanceKm = wind.features.length
      ? Math.min(...wind.features.map((feature) => turf.distance(point, feature, { units: "kilometers" })))
      : null;
    const nearestPowerlineDistanceKm = powerlines.features.length
      ? Math.min(...powerlines.features.map((feature) => turf.pointToLineDistance(point, feature, { units: "kilometers" })))
      : null;
    const pressureLevel = classifyPressure(windHits.length, powerlineLengthKm);
    return {
      buffer: buffer.geometry,
      windCount: windHits.length,
      powerlineLengthKm,
      nearestWindDistanceKm,
      nearestPowerlineDistanceKm,
      pressureLevel,
      suggestion: suggestionFor(pressureLevel),
      radiusKm,
      affectedFeatures: [...windHits, ...powerlineHits]
    };
  }

  async function executeNodeGPAnalysis(pointGeometry, radiusKm) {
    const response = await fetch(window.CraneConfig.NODE_GP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ point: pointGeometry, radiusKm })
    });
    if (!response.ok) throw new Error(`Node GP HTTP ${response.status}`);
    const data = await response.json();
    return {
      ...data,
      buffer: data.buffer.type === "Feature" ? data.buffer.geometry : data.buffer,
      radiusKm,
      affectedFeatures: data.affectedFeatures || []
    };
  }

  async function executeWPSNodePressureAnalysis(pointGeometry, radiusKm) {
    const distanceDegrees = Number(radiusKm) / 111.32;
    const executeXml = `<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute service="WPS" version="1.0.0"
  xmlns:wps="http://www.opengis.net/wps/1.0.0"
  xmlns:ows="http://www.opengis.net/ows/1.1">
  <ows:Identifier>JTS:buffer</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>geom</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/json"><![CDATA[${JSON.stringify(pointGeometry)}]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>distance</ows:Identifier>
      <wps:Data><wps:LiteralData>${distanceDegrees}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>quadrantSegments</ows:Identifier>
      <wps:Data><wps:LiteralData>18</wps:LiteralData></wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`;
    const response = await fetch(window.CraneConfig.WPS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/xml;charset=utf-8" },
      body: executeXml
    });
    if (!response.ok) throw new Error(`WPS HTTP ${response.status}`);
    const text = await response.text();
    if (/ExceptionReport|ExceptionText/i.test(text)) {
      throw new Error(text.replace(/\s+/g, " ").slice(0, 180));
    }
    const wpsBuffer = JSON.parse(text);
    const result = await executeFrontendGPAnalysis(pointGeometry, radiusKm);
    result.buffer = wpsBuffer.type === "Feature" ? wpsBuffer.geometry : wpsBuffer;
    result.engine = "GeoServer WPS buffer";
    return result;
  }

  async function executeGPAnalysis(pointGeometry, radiusKm) {
    if (window.CraneConfig.USE_WPS) {
      try {
        setStatus("正在执行节点周边基础设施压力分析...");
        return await executeWPSNodePressureAnalysis(pointGeometry, radiusKm);
      } catch (error) {
        setStatus("分析服务暂不可用，已切换到本地计算");
      }
    }
    if (window.CraneConfig.USE_NODE_GP || window.CraneConfig.USE_WPS) {
      try {
        setStatus("正在执行节点周边基础设施压力分析...");
        return await executeNodeGPAnalysis(pointGeometry, radiusKm);
      } catch (error) {
        setStatus("分析服务暂不可用，已切换到本地计算");
      }
    }
    return executeFrontendGPAnalysis(pointGeometry, radiusKm);
  }

  async function runAnalysis() {
    const pointGeometry = getInputPoint();
    const radiusKm = Number(document.getElementById("gp-radius-input").value) || 20;
    if (!pointGeometry) {
      setStatus("请选择迁徙节点或在地图上取点");
      return null;
    }
    const result = await executeGPAnalysis(pointGeometry, radiusKm);
    const pointFeature = { type: "Feature", properties: { name: "分析点" }, geometry: pointGeometry };
    window.CraneLayers.showAnalysis(result.buffer, result.affectedFeatures, pointFeature);
    renderResult(result);
    saveLastResult(result);
    setStatus(`分析完成：${result.pressureLevel}压力`);
    return result;
  }

  function handleMapClick(event) {
    if (!pickingMapPoint) return false;
    selectedPoint = {
      type: "Point",
      coordinates: ol.proj.toLonLat(event.coordinate).map((value) => Number(value.toFixed(6)))
    };
    document.getElementById("gp-node-select").value = "";
    pickingMapPoint = false;
    document.getElementById("gp-map-point-btn").classList.remove("is-active");
    window.CraneLayers.showAnalysis(null, [], { type: "Feature", properties: { name: "分析点" }, geometry: selectedPoint });
    setStatus(`已取点：${selectedPoint.coordinates.join(", ")}`);
    return true;
  }

  function setupGPEvents() {
    document.getElementById("gp-map-point-btn").addEventListener("click", () => {
      pickingMapPoint = !pickingMapPoint;
      document.getElementById("gp-map-point-btn").classList.toggle("is-active", pickingMapPoint);
      setStatus(pickingMapPoint ? "在地图上点击一个分析点" : "已取消地图取点");
    });
    document.getElementById("gp-start-btn").addEventListener("click", runAnalysis);
  }

  window.CraneGP = {
    setupGPEvents,
    handleMapClick,
    executeGPAnalysis,
    executeFrontendGPAnalysis,
    executeNodeGPAnalysis,
    executeWPSNodePressureAnalysis,
    runAnalysis
  };
})();
