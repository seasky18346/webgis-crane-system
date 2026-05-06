(function () {
  let map;
  let addMode = false;
  let selectedFeature = null;
  let modifyInteraction = null;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function setStatus(message) {
    document.getElementById("edit-status").textContent = message;
  }

  function nextNoteId() {
    const ids = window.CraneLayers.sources.conservation_notes.getFeatures()
      .map((feature) => String(feature.get("note_id") || "").replace(/\D/g, ""))
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    const next = ids.length ? Math.max(...ids) + 1 : 1;
    return `C${String(next).padStart(2, "0")}`;
  }

  function readForm() {
    return {
      name: document.getElementById("edit-name").value.trim() || "未命名保护建议",
      note_type: document.getElementById("edit-type").value,
      priority: document.getElementById("edit-priority").value,
      suggestion: document.getElementById("edit-suggestion").value.trim(),
      editor: document.getElementById("edit-editor").value.trim() || "课程演示",
      edit_date: today(),
      remark: document.getElementById("edit-remark").value.trim()
    };
  }

  function fillForm(feature) {
    selectedFeature = feature;
    document.getElementById("edit-name").value = feature.get("name") || "";
    document.getElementById("edit-type").value = feature.get("note_type") || "保护建议点";
    document.getElementById("edit-priority").value = feature.get("priority") || "中";
    document.getElementById("edit-suggestion").value = feature.get("suggestion") || "";
    document.getElementById("edit-editor").value = feature.get("editor") || "课程演示";
    document.getElementById("edit-remark").value = feature.get("remark") || "";
    setStatus(`已选择：${feature.get("note_id") || ""} ${feature.get("name") || ""}`);
  }

  function saveCurrentEdit() {
    if (!selectedFeature) {
      setStatus("请先选择或新增一个保护建议点");
      return;
    }
    selectedFeature.setProperties(readForm());
    selectedFeature.set("_layerKey", "conservation_notes", true);
    window.CraneLayers.refreshStyles();
    if (window.CraneConfig.USE_GEOSERVER) {
      saveEditsToWFST("update", selectedFeature);
    } else {
      setStatus("已保存到前端内存，可导出 GeoJSON");
    }
  }

  function deleteCurrentEdit() {
    if (!selectedFeature) {
      setStatus("请先选择一个保护建议点");
      return;
    }
    window.CraneLayers.sources.conservation_notes.removeFeature(selectedFeature);
    selectedFeature = null;
    window.CraneLayers.refreshStyles();
    setStatus("已删除前端内存中的保护建议点");
  }

  function exportGeoJSON() {
    const data = window.CraneLayers.getCollectionGeoJSON("conservation_notes");
    data.name = "conservation_notes";
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/geo+json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conservation_notes_edited.geojson";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("已生成导出文件");
  }

  function toggleAddMode() {
    addMode = !addMode;
    document.getElementById("edit-add-btn").classList.toggle("is-active", addMode);
    setStatus(addMode ? "在地图上点击新增保护建议点" : "已退出新增模式");
  }

  function createNoteAt(coordinate) {
    const properties = {
      note_id: nextNoteId(),
      ...readForm()
    };
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(coordinate),
      ...properties
    });
    feature.set("_layerKey", "conservation_notes", true);
    window.CraneLayers.sources.conservation_notes.addFeature(feature);
    fillForm(feature);
    window.CraneLayers.refreshStyles();
    setStatus(`已新增：${properties.note_id}`);
  }

  function handleMapClick(event) {
    if (addMode) {
      createNoteAt(event.coordinate);
      addMode = false;
      document.getElementById("edit-add-btn").classList.remove("is-active");
      return true;
    }
    let handled = false;
    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      if (feature.get("_layerKey") === "conservation_notes") {
        fillForm(feature);
        handled = true;
        return true;
      }
      return false;
    }, { hitTolerance: 6 });
    return false;
  }

  function saveEditsToWFST(action, feature) {
    // TODO: GeoServer WFS-T 发布完成后，在这里封装 Transaction Insert/Update/Delete。
    setStatus(`WFS-T 尚未启用，本次 ${action} 已保留在前端内存`);
    return { action, feature };
  }

  function setupEditing(targetMap) {
    map = targetMap;
    modifyInteraction = new ol.interaction.Modify({
      source: window.CraneLayers.sources.conservation_notes
    });
    map.addInteraction(modifyInteraction);
    document.getElementById("edit-add-btn").addEventListener("click", toggleAddMode);
    document.getElementById("edit-save-btn").addEventListener("click", saveCurrentEdit);
    document.getElementById("edit-delete-btn").addEventListener("click", deleteCurrentEdit);
    document.getElementById("edit-export-btn").addEventListener("click", exportGeoJSON);
  }

  window.CraneEdit = {
    setupEditing,
    handleMapClick,
    fillForm,
    saveCurrentEdit,
    deleteCurrentEdit,
    exportGeoJSON,
    saveEditsToWFST
  };
})();
