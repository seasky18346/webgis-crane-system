(function () {
  let bootstrapReady = false;
  let bootstrapPromise = null;
  let applicationScriptsPromise = null;

  const APP_SCRIPTS = [
    "vendor/ol/ol.js",
    "vendor/turf/turf.min.js",
    "js/demoData.js",
    "js/renderers.js",
    "js/layers.js",
    "js/query.js",
    "js/edit.js",
    "js/gpAnalysis.js",
    "js/gpsReplay.js",
    "js/animation.js"
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`无法加载 ${src}`));
      document.body.appendChild(script);
    });
  }

  function loadApplicationScripts() {
    if (!applicationScriptsPromise) {
      applicationScriptsPromise = APP_SCRIPTS.reduce(
        (chain, src) => chain.then(() => loadScript(src)),
        Promise.resolve()
      ).catch((error) => {
        applicationScriptsPromise = null;
        throw error;
      });
    }
    return applicationScriptsPromise;
  }

  function populateNodeSelect() {
    const select = document.getElementById("gp-node-select");
    const options = window.CraneLayers.sources.migration_nodes.getFeatures()
      .map((feature) => ({
        id: feature.get("node_id"),
        name: feature.get("node_name")
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
    select.innerHTML = "<option value=\"\">地图取点或选择节点</option>" +
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

  function setupCollapsiblePanels() {
    document.querySelectorAll(".tool-block, .output-block").forEach((panel) => {
      const title = panel.querySelector("h2");
      if (!title || title.querySelector(".collapse-toggle")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collapse-toggle";
      button.textContent = "收起";
      button.setAttribute("aria-label", `收起或展开${title.childNodes[0] ? title.childNodes[0].textContent.trim() : "模块"}`);
      button.addEventListener("click", () => {
        panel.classList.toggle("is-collapsed");
        button.textContent = panel.classList.contains("is-collapsed") ? "展开" : "收起";
      });
      title.appendChild(button);
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
    document.getElementById("data-mode-chip").textContent = window.CraneConfig.USE_GEOSERVER ? "服务数据" : "本地演示数据";
    document.getElementById("gp-mode-chip").textContent = "节点周边基础设施压力分析";
    document.getElementById("service-chip").textContent = window.CraneConfig.USE_GEOSERVER ? "服务模式" : "课程演示模式";
  }

  function hideLaunchScreen() {
    document.body.classList.remove("is-launching");
    const launch = document.getElementById("launch-screen");
    if (launch) launch.setAttribute("aria-hidden", "true");
  }

  function showLaunchScreen() {
    document.body.classList.add("is-launching");
    const launch = document.getElementById("launch-screen");
    if (launch) launch.setAttribute("aria-hidden", "false");
  }

  function setButtonBusy(button, busy, label) {
    if (!button) return;
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
    button.disabled = busy;
    button.classList.toggle("is-loading", busy);
    button.textContent = busy ? label : button.dataset.originalLabel;
  }

  function reportLaunchError(prefix, error) {
    const copy = document.querySelector(".launch-copy");
    if (copy) copy.textContent = `${prefix}：${error.message}`;
  }

  function ensureBootstrap() {
    if (bootstrapReady) return Promise.resolve();
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap().catch((error) => {
        bootstrapPromise = null;
        throw error;
      });
    }
    return bootstrapPromise;
  }

  function setupLaunchActions() {
    showLaunchScreen();
    const enter = document.getElementById("enter-system-btn");
    const dashboard = document.getElementById("open-dashboard-btn");
    const demo = document.getElementById("launch-demo-btn");
    const back = document.getElementById("back-launch-btn");
    const headerDashboard = document.getElementById("header-dashboard-btn");
    const floatingNav = document.querySelector(".floating-nav");
    const floatingMenu = document.getElementById("floating-menu-btn");
    const floatingHome = document.getElementById("floating-home-btn");
    const floatingDashboard = document.getElementById("floating-dashboard-btn");
    const panelsToggle = document.getElementById("panels-toggle-btn");
    const setFloatingNavOpen = (open) => {
      if (!floatingNav || !floatingMenu) return;
      floatingNav.classList.toggle("is-open", open);
      floatingNav.setAttribute("aria-expanded", open ? "true" : "false");
      floatingMenu.setAttribute("aria-expanded", open ? "true" : "false");
      floatingMenu.setAttribute("aria-label", open ? "收起快速操作" : "展开快速操作");
    };

    if (enter) enter.addEventListener("click", async () => {
      setButtonBusy(enter, true, "系统加载中...");
      try {
        await ensureBootstrap();
        hideLaunchScreen();
      } catch (error) {
        reportLaunchError("系统初始化失败", error);
      } finally {
        setButtonBusy(enter, false);
      }
    });
    if (dashboard) dashboard.addEventListener("click", () => {
      window.location.href = window.CraneConfig.DASHBOARD_URL;
    });
    if (headerDashboard) headerDashboard.addEventListener("click", () => {
      window.location.href = window.CraneConfig.DASHBOARD_URL;
    });
    if (back) back.addEventListener("click", showLaunchScreen);
    if (floatingMenu) floatingMenu.addEventListener("click", () => {
      setFloatingNavOpen(!floatingNav.classList.contains("is-open"));
    });
    if (floatingHome) floatingHome.addEventListener("click", () => {
      showLaunchScreen();
      setFloatingNavOpen(false);
    });
    if (floatingDashboard) floatingDashboard.addEventListener("click", () => {
      window.location.href = window.CraneConfig.DASHBOARD_URL;
    });
    if (panelsToggle) panelsToggle.addEventListener("click", () => {
      document.body.classList.toggle("panels-hidden");
      panelsToggle.textContent = document.body.classList.contains("panels-hidden") ? "显示面板" : "隐藏面板";
      setFloatingNavOpen(false);
    });
    if (demo) demo.addEventListener("click", async () => {
      setButtonBusy(demo, true, "演示加载中...");
      try {
        await ensureBootstrap();
        hideLaunchScreen();
        if (window.CraneAnimation) await window.CraneAnimation.startFullDemo();
      } catch (error) {
        reportLaunchError("演示启动失败", error);
      } finally {
        setButtonBusy(demo, false);
      }
    });
  }

  async function bootstrap() {
    await loadApplicationScripts();
    setupCollapsiblePanels();
    setModeChips();
    const map = window.CraneLayers.initMap();
    await window.CraneLayers.loadAllLayers();
    populateNodeSelect();
    setupLayerToggles();
    setupRenderControls();
    window.CraneQuery.setupQueryEvents();
    window.CraneEdit.setupEditing(map);
    window.CraneGP.setupGPEvents();
    window.CraneGPSReplay.setupControls();
    window.CraneAnimation.setupAnimationEvents();
    setupPopup(map);
    window.CraneRenderers.updateLegend();
    window.CraneLayers.zoomToAll();
    document.getElementById("query-results").innerHTML = "<p class=\"empty-note\">系统已加载，可开始查询或演示</p>";
    document.getElementById("gp-results").innerHTML = "<p class=\"empty-note\">请选择节点或地图取点后开始分析</p>";
    bootstrapReady = true;
  }

  window.addEventListener("DOMContentLoaded", () => {
    setupLaunchActions();
  });
})();
