(function () {
  let timer = null;
  let cursor = 0;

  function highRiskCorridors() {
    return window.CraneLayers.sources.migration_corridors.getFeatures()
      .filter((feature) => feature.get("risk_level") === "高" || feature.get("corridor_type") === "高风险廊道");
  }

  function highPriorityNotes() {
    return window.CraneLayers.sources.conservation_notes.getFeatures()
      .filter((feature) => feature.get("priority") === "高");
  }

  function setVisible(keys) {
    window.CraneLayers.layerOrder.forEach((key) => {
      window.CraneLayers.setLayerVisible(key, keys.includes(key));
      const checkbox = document.getElementById(`layer-${key}`);
      if (checkbox) checkbox.checked = keys.includes(key);
    });
  }

  function setStepStatus(text) {
    const list = document.getElementById("query-results");
    list.innerHTML = `<p class="empty-note">${text}</p>`;
  }

  function step1() {
    stopAnimation();
    window.CraneLayers.clearAnalysis();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors"]);
    setStepStatus("Step 1：显示自然迁徙节点和迁徙廊道");
    window.CraneLayers.zoomToAll();
  }

  function step2() {
    stopAnimation();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    setStepStatus("Step 2：叠加风电场和输电线路");
    window.CraneLayers.zoomToAll();
  }

  function step3() {
    stopAnimation();
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    const features = highRiskCorridors();
    window.CraneLayers.setHighlight(features);
    window.CraneQuery.renderResults(features, "Step 3 高风险廊道");
  }

  function step4() {
    stopAnimation();
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    const features = highPriorityNotes();
    window.CraneLayers.setHighlight(features);
    window.CraneQuery.renderResults(features, "Step 4 高优先级保护建议");
  }

  async function step5() {
    stopAnimation();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    document.getElementById("gp-node-select").value = "N05";
    document.getElementById("gp-radius-input").value = "30";
    setStepStatus("Step 5：对 N05 科尔沁草原停歇区执行节点周边基础设施压力分析");
    await window.CraneGP.runAnalysis();
  }

  function startAnimation() {
    const features = highRiskCorridors();
    if (!features.length) return;
    stopAnimation();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    cursor = 0;
    timer = window.setInterval(() => {
      const feature = features[cursor % features.length];
      window.CraneLayers.setHighlight([feature]);
      window.CraneLayers.zoomToFeatures([feature]);
      window.CraneQuery.renderResults([feature], "逐条高亮高风险廊道");
      cursor += 1;
    }, 1500);
  }

  function stopAnimation() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function resetAnimation() {
    stopAnimation();
    cursor = 0;
    window.CraneLayers.clearHighlight();
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    setStepStatus("演示已重置");
    window.CraneLayers.zoomToAll();
  }

  function setupAnimationEvents() {
    document.getElementById("demo-step-1").addEventListener("click", step1);
    document.getElementById("demo-step-2").addEventListener("click", step2);
    document.getElementById("demo-step-3").addEventListener("click", step3);
    document.getElementById("demo-step-4").addEventListener("click", step4);
    document.getElementById("demo-step-5").addEventListener("click", step5);
    document.getElementById("anim-start").addEventListener("click", startAnimation);
    document.getElementById("anim-pause").addEventListener("click", stopAnimation);
    document.getElementById("anim-reset").addEventListener("click", resetAnimation);
  }

  window.CraneAnimation = {
    setupAnimationEvents,
    step1,
    step2,
    step3,
    step4,
    step5,
    startAnimation,
    stopAnimation,
    resetAnimation
  };
})();
