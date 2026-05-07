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

  function layerFeatures(key) {
    return window.CraneLayers.sources[key].getFeatures();
  }

  function infraFeatures() {
    return [
      ...layerFeatures("wind_farms"),
      ...layerFeatures("powerlines")
    ];
  }

  function selectedNode(nodeId) {
    return layerFeatures("migration_nodes")
      .filter((feature) => feature.get("node_id") === nodeId);
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

  function setActiveDemoButton(buttonId) {
    document.querySelectorAll(".step-grid button").forEach((button) => {
      const active = button.id === buttonId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setDemoStage(step, title, detail, updateList) {
    const banner = document.getElementById("demo-stage-banner");
    const stepNode = document.getElementById("demo-stage-step");
    const titleNode = document.getElementById("demo-stage-title");
    const detailNode = document.getElementById("demo-stage-detail");
    if (banner && stepNode && titleNode && detailNode) {
      stepNode.textContent = step;
      titleNode.textContent = title;
      detailNode.textContent = detail;
      banner.classList.remove("is-pulsing");
      void banner.offsetWidth;
      banner.classList.add("is-active", "is-pulsing");
    }
    setStepStatus(`${step}：${title}。${detail}`, updateList);
  }

  function highlightAndZoom(features) {
    if (!features || !features.length) return;
    window.CraneLayers.setHighlight(features);
    window.CraneLayers.zoomToFeatures(features);
  }

  function step1() {
    stopAnimation();
    setActiveDemoButton("demo-step-1");
    window.CraneLayers.clearAnalysis();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors"]);
    const features = [...layerFeatures("migration_nodes"), ...layerFeatures("migration_corridors")];
    highlightAndZoom(features);
    setDemoStage("Step 1", "自然迁徙网络", "显示迁徙节点与基础廊道，先建立白枕鹤春季迁徙网络的整体空间格局。");
  }

  function step2() {
    stopAnimation();
    setActiveDemoButton("demo-step-2");
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    highlightAndZoom(infraFeatures());
    setDemoStage("Step 2", "基础设施叠加", "高亮风电场和输电线路，观察它们与迁徙节点、廊道的空间邻近关系。");
  }

  function step3() {
    stopAnimation();
    setActiveDemoButton("demo-step-3");
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    const features = highRiskCorridors();
    highlightAndZoom(features);
    window.CraneQuery.renderResults(features, "Step 3 高风险廊道");
    setDemoStage("Step 3", "高风险廊道识别", "重点查看成本增加明显、受基础设施影响更强的廊道段。", false);
  }

  function step4() {
    stopAnimation();
    setActiveDemoButton("demo-step-4");
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    const features = highPriorityNotes();
    highlightAndZoom(features);
    window.CraneQuery.renderResults(features, "Step 4 高优先级保护建议");
    setDemoStage("Step 4", "保护建议与核查点", "显示高优先级保护建议点，为后续廊道管控和人工核查提供位置线索。", false);
  }

  async function step5() {
    stopAnimation();
    setActiveDemoButton("demo-step-5");
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    document.getElementById("gp-node-select").value = "N05";
    document.getElementById("gp-radius-input").value = "30";
    highlightAndZoom(selectedNode("N05"));
    setDemoStage("Step 5", "节点压力分析", "以 N05 科尔沁草原停歇区为例，计算周边风电场和输电线路压力。");
    await window.CraneGP.runAnalysis();
  }

  function startAnimation() {
    const features = highRiskCorridors();
    if (!features.length) return;
    stopAnimation();
    setActiveDemoButton("anim-start");
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    cursor = 0;
    timer = window.setInterval(() => {
      const feature = features[cursor % features.length];
      window.CraneLayers.setHighlight([feature]);
      window.CraneLayers.zoomToFeatures([feature]);
      window.CraneQuery.renderResults([feature], "逐条高亮高风险廊道");
      setDemoStage("高风险动画", `正在高亮 ${feature.get("edge_id") || "廊道"}`, "逐条查看高风险廊道，适合课程录屏讲解。", false);
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
    setActiveDemoButton("demo-step-1");
    window.CraneGPSReplay.pause();
    window.CraneLayers.clearAnalysis();
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes"]);
    const features = layerFeatures("migration_nodes");
    highlightAndZoom(features);
    setDemoStage("演示 1/8", "迁徙节点", "先显示白枕鹤春季迁徙网络中的停歇节点和连接节点。");
  }

  function demoStepCorridors() {
    stopAnimation();
    setActiveDemoButton("demo-step-1");
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors"]);
    const features = layerFeatures("migration_corridors");
    highlightAndZoom(features);
    setDemoStage("演示 2/8", "迁徙廊道", "叠加节点之间的迁徙廊道，展示春季北迁网络的连通关系。");
  }

  function demoStepInfrastructure() {
    stopAnimation();
    setActiveDemoButton("demo-step-2");
    window.CraneLayers.clearHighlight();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    highlightAndZoom(infraFeatures());
    setDemoStage("演示 3/8", "基础设施压力", "高亮风电场和输电线路，观察设施与迁徙廊道的叠加位置。");
  }

  function demoStepHighRisk() {
    stopAnimation();
    setActiveDemoButton("demo-step-3");
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines"]);
    const features = highRiskCorridors();
    highlightAndZoom(features);
    window.CraneQuery.renderResults(features, "演示 4/8 高风险廊道");
    setDemoStage("演示 4/8", "高风险廊道", "高亮成本增加明显的廊道，说明基础设施阻断效应的重点区域。", false);
  }

  function demoStepNotes() {
    stopAnimation();
    setActiveDemoButton("demo-step-4");
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    const features = highPriorityNotes();
    highlightAndZoom(features);
    window.CraneQuery.renderResults(features, "演示 5/8 高优先级保护建议");
    setDemoStage("演示 5/8", "保护建议点", "显示高优先级保护建议和人工核查点，承接风险识别后的管理建议。", false);
  }

  async function demoStepGP() {
    stopAnimation();
    setActiveDemoButton("demo-step-5");
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    document.getElementById("gp-node-select").value = "N05";
    document.getElementById("gp-radius-input").value = "30";
    highlightAndZoom(selectedNode("N05"));
    setDemoStage("演示 6/8", "节点压力分析", "选择 N05 科尔沁草原停歇区，执行节点周边基础设施压力分析。");
    await window.CraneGP.runAnalysis();
  }

  async function demoStepGps() {
    setActiveDemoButton(null);
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    setDemoStage("演示 7/8", "模拟 GPS 轨迹回放", "启动轨迹回放演示，移动点经过高风险廊道时同步高亮提醒。");
    await window.CraneGPSReplay.start({ reset: true, interval: 1300 });
  }

  function demoStepDashboardTip() {
    setActiveDemoButton(null);
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    window.CraneLayers.clearHighlight();
    setDemoStage("演示 8/8", "进入数据大屏", "可打开数据大屏查看态势统计、模拟 GPS 播报和小地图。");
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
    setActiveDemoButton(null);
    window.CraneGPSReplay.pause();
    setDemoStage("演示暂停", "一键演示已暂停", "可重新启动演示，或点击重置恢复完整图层。");
  }

  function resetAnimation() {
    clearAutoTimer();
    autoPaused = false;
    autoStepIndex = 0;
    stopAnimation();
    cursor = 0;
    setActiveDemoButton(null);
    window.CraneGPSReplay.reset();
    window.CraneLayers.clearHighlight();
    window.CraneLayers.clearAnalysis();
    setVisible(["migration_nodes", "migration_corridors", "wind_farms", "powerlines", "conservation_notes"]);
    setDemoStage("演示重置", "已恢复完整图层", "点击“一键演示”可重新开始分步讲解。");
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
