(function () {
  const fallbackStream = [
    {
      bird_id: "WNC-DEMO-01",
      timestamp: "2026-03-18T08:00:00+08:00",
      lon: 117.72,
      lat: 39.05,
      near_node: "N03",
      corridor_id: "E03",
      risk_level: "低",
      message: "[模拟GPS] WNC-DEMO-01 进入节点 N03 周边，当前风险等级：低"
    },
    {
      bird_id: "WNC-DEMO-01",
      timestamp: "2026-03-18T10:00:00+08:00",
      lon: 119.0,
      lat: 40.25,
      near_node: "N04",
      corridor_id: "E03",
      risk_level: "高",
      message: "[模拟GPS] WNC-DEMO-01 通过高风险廊道 E03，建议关注辽西丘陵段连通性"
    },
    {
      bird_id: "WNC-DEMO-01",
      timestamp: "2026-03-18T12:00:00+08:00",
      lon: 120.85,
      lat: 41.35,
      near_node: "N04",
      corridor_id: "E04",
      risk_level: "高",
      message: "[模拟GPS] WNC-DEMO-01 靠近输电线路缓冲区，当前风险等级：高"
    },
    {
      bird_id: "WNC-DEMO-01",
      timestamp: "2026-03-18T14:00:00+08:00",
      lon: 121.45,
      lat: 42.65,
      near_node: "N05",
      corridor_id: "E04",
      risk_level: "高",
      message: "[模拟GPS] WNC-DEMO-01 通过高风险廊道 E04，成本增加比例 65.0%"
    },
    {
      bird_id: "WNC-DEMO-01",
      timestamp: "2026-03-18T16:00:00+08:00",
      lon: 122.25,
      lat: 44.35,
      near_node: "N05",
      corridor_id: "E06",
      risk_level: "高",
      message: "[模拟GPS] WNC-DEMO-01 抵达核心停歇节点 N05，基础设施压力较高"
    }
  ];

  let stream = [];
  let cursor = 0;
  let timer = null;
  let intervalMs = 1400;

  function setStatus(text) {
    document.querySelectorAll("[data-gps-status]").forEach((node) => {
      node.textContent = text;
    });
  }

  function appendFeed(item) {
    const html = `
      <div class="gps-feed-item ${item.risk_level === "高" ? "is-high" : ""}">
        <span>${item.timestamp ? item.timestamp.replace("T", " ").slice(0, 16) : "模拟时间"}</span>
        <strong>${item.message}</strong>
      </div>
    `;
    document.querySelectorAll("[data-gps-feed]").forEach((feed) => {
      feed.insertAdjacentHTML("afterbegin", html);
      while (feed.children.length > 8) {
        feed.removeChild(feed.lastElementChild);
      }
    });
  }

  async function loadStream() {
    if (stream.length) return stream;
    try {
      const response = await fetch(window.CraneConfig.GPS_STREAM_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      stream = Array.isArray(data) ? data : data.features || [];
    } catch (error) {
      stream = fallbackStream.slice();
      setStatus("已使用内置模拟 GPS 轨迹");
    }
    return stream;
  }

  function highlightCorridor(item) {
    if (!item || !item.corridor_id || !window.CraneLayers) return;
    const feature = window.CraneLayers.sources.migration_corridors.getFeatures()
      .find((corridor) => corridor.get("edge_id") === item.corridor_id);
    if (feature && item.risk_level === "高") {
      window.CraneLayers.setHighlight([feature]);
    }
  }

  function renderPoint(item) {
    if (!item || !window.CraneLayers) return;
    const feature = window.CraneLayers.setGpsPoint(item);
    if (feature && item.risk_level === "高") {
      highlightCorridor(item);
    }
    appendFeed(item);
    setStatus(`轨迹回放演示：${item.bird_id} / ${item.near_node || "廊道"} / ${item.risk_level}风险`);
  }

  async function tick() {
    await loadStream();
    if (!stream.length) {
      setStatus("暂无模拟 GPS 轨迹");
      return;
    }
    const item = stream[cursor % stream.length];
    renderPoint(item);
    cursor += 1;
  }

  async function start(options) {
    await loadStream();
    const next = options || {};
    if (next.reset) cursor = 0;
    intervalMs = next.interval || intervalMs;
    pause();
    await tick();
    timer = window.setInterval(tick, intervalMs);
    setStatus("模拟 GPS 轨迹回放中");
  }

  function pause() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function reset() {
    pause();
    cursor = 0;
    if (window.CraneLayers) {
      window.CraneLayers.clearGpsPoint();
      window.CraneLayers.clearHighlight();
    }
    document.querySelectorAll("[data-gps-feed]").forEach((feed) => {
      feed.innerHTML = "<p class=\"empty-note\">模拟 GPS 播报等待启动</p>";
    });
    setStatus("模拟 GPS 已重置");
  }

  function setupControls() {
    document.querySelectorAll("[data-gps-start]").forEach((button) => {
      button.addEventListener("click", () => start({ reset: true }));
    });
    document.querySelectorAll("[data-gps-pause]").forEach((button) => {
      button.addEventListener("click", () => {
        pause();
        setStatus("模拟 GPS 已暂停");
      });
    });
    document.querySelectorAll("[data-gps-reset]").forEach((button) => {
      button.addEventListener("click", reset);
    });
  }

  window.CraneGPSReplay = {
    loadStream,
    setupControls,
    start,
    pause,
    reset,
    tick,
    get stream() {
      return stream;
    }
  };
})();
