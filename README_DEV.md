# 飞越风与电：白枕鹤迁徙廊道 WebGIS 分析系统

## 1. 项目简介

这是课程作业级 WebGIS 演示系统，用于展示白枕鹤春季迁徙节点、迁徙廊道、风电场、输电线路、保护建议点和阻断风险结果。

系统优先保证能运行、能演示、能截图。复杂 LCP、Circuitscape、阻力面构建等科研模型不在前端实时运行，当前以预计算/演示图层展示。

## 2. 技术栈

- 前端：HTML + CSS + JavaScript
- 地图：OpenLayers `10.4.0`
- 前端空间分析兜底：Turf.js `6.5.0`
- 可选后端 GP：Node.js，正式依赖 Express + Turf.js
- 可选 GIS 服务：GeoServer WMS/WFS/WFS-T/WPS

## 3. 目录结构

```text
webgis-crane-system/
├─ index.html
├─ css/style.css
├─ js/
│  ├─ config.js
│  ├─ main.js
│  ├─ layers.js
│  ├─ query.js
│  ├─ edit.js
│  ├─ renderers.js
│  ├─ gpAnalysis.js
│  ├─ animation.js
│  └─ demoData.js
├─ data/*.geojson
├─ server/
│  ├─ package.json
│  └─ gp-server.js
├─ geoserver/
│  ├─ publish_notes.md
│  └─ sample_sld/
└─ vendor/
   ├─ ol/
   └─ turf/
```

## 4. 如何直接打开前端

可以直接打开：

```powershell
D:\WebGIS\webgis-crane-system\index.html
```

更推荐用本地静态服务打开，浏览器读取 `data/*.geojson` 更稳定：

```powershell
cd D:\WebGIS\webgis-crane-system
python -m http.server 5173
```

访问：

```text
http://localhost:5173
```

## 5. 如何启动 Node GP 服务

当前机器检测到 Node.js `v24.14.0`，但没有检测到 `npm`。因此 `gp-server.js` 内置了无依赖兜底服务，可直接运行：

```powershell
cd D:\WebGIS\webgis-crane-system\server
node gp-server.js
```

访问前端：

```text
http://localhost:3000
```

API：

```text
POST http://localhost:3000/api/gp/node-pressure
```

如果后续安装了正式 Node.js/npm，可启用 Express + Turf.js 模式：

```powershell
cd D:\WebGIS\webgis-crane-system\server
npm install
npm start
```

若要让前端调用 Node GP，把 `js/config.js` 中：

```js
USE_NODE_GP: true
```

## 6. 如何配置 GeoServer

当前本机检查结果：

- GeoServer 可访问：`http://localhost:8080/geoserver`
- GeoServer 版本：`2.28.3`
- WMS：可访问
- WFS：可访问
- WPS：不可用，返回 `No service: ( wps )`
- Docker：命令行未检测到
- npm：命令行未检测到
- Java：`21.0.9`

GeoServer 发布说明见：

```text
D:\WebGIS\webgis-crane-system\geoserver\publish_notes.md
```

建议 workspace：

```text
crane_webgis
```

建议图层名：

```text
migration_nodes
migration_corridors
wind_farms
powerlines
conservation_notes
```

## 7. 如何替换服务地址

所有可替换配置集中在：

```text
D:\WebGIS\webgis-crane-system\js\config.js
```

主要配置项：

- `USE_GEOSERVER`
- `USE_WPS`
- `USE_NODE_GP`
- `GEOSERVER_BASE_URL`
- `GEOSERVER_WORKSPACE`
- `WMS_URL`
- `WFS_URL`
- `WPS_URL`
- `NODE_GP_URL`
- `LAYER_NAMES`
- `LOCAL_DATA_URLS`

## 8. WMS / WFS / WFS-T / WPS 当前状态

- WMS：本机 GeoServer 服务可访问，但课程图层尚未正式发布。
- WFS：本机 GeoServer 服务可访问，前端已预留 WFS GeoJSON 读取逻辑。
- WFS-T：未启用；当前采用前端内存编辑 + 导出 GeoJSON。
- WPS：未启用；当前默认使用前端 Turf GP，Node GP 可选。

## 9. 本地 GeoJSON 演示模式

默认配置：

```js
USE_GEOSERVER: false,
USE_WPS: false,
USE_NODE_GP: false
```

系统会加载 `data/*.geojson`。如果直接双击 HTML 导致浏览器限制本地 fetch，系统会自动使用 `js/demoData.js` 中的同源内置演示数据。

## 10. 已实现功能

- 地图初始化、缩放、平移、全图显示
- OSM 底图
- 迁徙节点、迁徙廊道、风电场、输电线路、保护建议图层加载
- 图层开关
- 图例
- 点击要素弹出属性
- 节点查询：按 `node_id`、`node_type`、`risk_level`
- 廊道查询：按 `edge_id`、高风险、`cost_change_pct` 阈值
- 保护建议查询：按 `priority`
- 查询结果列表、高亮、定位
- `conservation_notes` 新增、属性修改、删除、导出 GeoJSON
- 节点按风险/重要性渲染
- 廊道按成本变化比例/风险等级渲染
- 保护建议按优先级渲染
- 节点周边基础设施压力分析
- 分析缓冲区、风电场数量、输电线路长度、最近距离、压力等级和建议输出
- 迁徙路线/阻断效应 Step 演示
- 高风险廊道逐条高亮动画

## 11. 模拟实现功能

- 当前数据为课程演示数据，不代表科研级精确结果。
- WFS-T 函数 `saveEditsToWFST()` 已保留占位，当前不写入 GeoServer。
- WPS 函数 `executeWPSNodePressureAnalysis()` 已保留占位，当前不调用真实 WPS。
- Node GP 在无 npm 环境下会自动使用内置轻量算法；安装 Express + Turf.js 后会切换到正式依赖。

## 12. 已知问题

- GeoServer WPS 插件未启用。
- GeoServer 课程图层尚未通过服务正式发布。
- Shapefile 会截断长字段名，若要保持字段完整，建议用 PostGIS 或 GeoPackage。
- OSM 底图需要网络；离线时专题图层仍可显示，但底图可能为空。
- 前端导出的 GeoJSON 需要手动替换或上传到服务端。

## 13. 后续替换真实数据的步骤

1. 用真实预计算结果替换 `data/*.geojson`，保持字段名不变。
2. 检查地图中节点、廊道和设施位置是否合理。
3. 如需 GeoServer，发布到 workspace `crane_webgis`。
4. 将 `js/config.js` 中 `USE_GEOSERVER` 改为 `true`。
5. 如果完成 WFS-T 配置，补全 `js/edit.js` 中的 `saveEditsToWFST()`。
6. 如果安装 WPS 插件并实现流程，补全 `js/gpAnalysis.js` 中的 `executeWPSNodePressureAnalysis()`。
7. 录屏前测试查询、编辑、渲染、GP 分析和 Step 演示按钮。
