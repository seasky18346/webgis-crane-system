(function () {
  let timer = null;
  let autoTimer = null;
  let autoPaused = false;
  let autoStepIndex = 0;
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

  function setStepStatus(text, updateList) {
    const list = document.getElementById("query-results");
    if (list && updateList !== false) list.innerHTML = `<p class="empty-note">${text}</p>`;
    const demoStatus = document.getElementById("demo-status");
    if (demoStatus) demoStatus.textContent = text;
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

  function clearAutoTimer() {
    if (autoTimer) {
      window.clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function demoStepNodes() {
    stopAnimation();
    window.CraneGPSReplay.pause();
    window.CraneLayers.clearAnalysis();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes"]);
    setStepStatus("演示 1/8：显示白枕鹤春季迁徙网络节点");
    window.CraneLayers.zoomToAll();
  }

  function demoStepCorridors() {
    stopAnimation();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors"]);
    setStepStatus("演示 2/8：叠加迁徙廊道，展示节点之间的连通关系");
    window.CraneLayers.zoomToAll();
  }

  function demoStepInfrastructure() {
    stopAnimation();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    setStepStatus("演示 3/8：叠加风电场和输电线路，观察基础设施压力");
    window.CraneLayers.zoomToAll();
  }

  function demoStepHighRisk() {
    stopAnimation();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    const features = highRiskCorridors();
    window.CraneLayers.setHighlight(features);
    window.CraneQuery.renderResults(features, "演示 4/8 高风险廊道");
    setStepStatus("演示 4/8：高亮成本增加明显的高风险廊道", false);
  }

  function demoStepNotes() {
    stopAnimation();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    const features = highPriorityNotes();
    window.CraneLayers.setHighlight(features);
    window.CraneQuery.renderResults(features, "演示 5/8 高优先级保护建议");
    setStepStatus("演示 5/8：显示保护建议点和人工核查对象", false);
  }

  async function demoStepGP() {
    stopAnimation();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    document.getElementById("gp-node-select").value = "N05";
    document.getElementById("gp-radius-input").value = "30";
    setStepStatus("演示 6/8：对 N05 执行节点周边基础设施压力分析");
    await window.CraneGP.runAnalysis();
  }

  async function demoStepGps() {
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    setStepStatus("演示 7/8：启动模拟 GPS 轨迹回放，遇到高风险廊道时自动提醒");
    await window.CraneGPSReplay.start({ reset: true, interval: 1300 });
  }

  function demoStepDashboardTip() {
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    setStepStatus("演示 8/8：可打开数据大屏查看态势统计、模拟 GPS 播报和小地图");
  }

  const fullDemoSteps = [
    demoStepNodes,
    demoStepCorridors,
    demoStepInfrastructure,
    demoStepHighRisk,
    demoStepNotes,
    demoStepGP,
    demoStepGps,
    demoStepDashboardTip
  ];

  async function runNextAutoStep() {
    clearAutoTimer();
    if (autoPaused || autoStepIndex >= fullDemoSteps.length) return;
    const step = fullDemoSteps[autoStepIndex];
    autoStepIndex += 1;
    await step();
    if (!autoPaused && autoStepIndex < fullDemoSteps.length) {
      autoTimer = window.setTimeout(runNextAutoStep, autoStepIndex === 7 ? 5200 : 2100);
    }
  }

  async function startFullDemo() {
    clearAutoTimer();
    stopAnimation();
    autoPaused = false;
    autoStepIndex = 0;
    await runNextAutoStep();
  }

  function pauseFullDemo() {
    autoPaused = true;
    clearAutoTimer();
    stopAnimation();
    window.CraneGPSReplay.pause();
    setStepStatus("一键演示已暂停，可重新启动或重置");
  }

  function resetAnimation() {
    clearAutoTimer();
    autoPaused = false;
    autoStepIndex = 0;
    stopAnimation();
    cursor = 0;
    window.CraneGPSReplay.reset();
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
    const autoStart = document.getElementById("demo-auto-start");
    const autoPause = document.getElementById("demo-auto-pause");
    if (autoStart) autoStart.addEventListener("click", startFullDemo);
    if (autoPause) autoPause.addEventListener("click", pauseFullDemo);
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
    resetAnimation,
    startFullDemo,
    pauseFullDemo
  };
})();
