# 飞越风与电：迁徙鸟类廊道与电力基础设施风险 WebGIS 分析平台

当前示范案例：白枕鹤春季迁徙网络。

这是课程级 WebGIS 分析平台，面向迁徙鸟类保护、电力基础设施风险识别和生态廊道管理展示。系统数据仍为白枕鹤春季迁徙网络示范数据，不代表多物种真实在线数据接入。

## 1. 当前入口

推荐启动 Node GP/静态服务：

```powershell
cd D:\WebGIS\webgis-crane-system
node server\gp-server.js
```

访问：

```text
http://localhost:3000/index.html
http://localhost:3000/dashboard.html
```

也可以直接打开：

```text
D:\WebGIS\webgis-crane-system\index.html
```

直接双击 HTML 时，部分浏览器可能限制 `fetch(data/*.geojson)`。系统保留 `js/demoData.js` 内置演示数据兜底，但课程录屏建议使用 `http://localhost:3000/`。

## 2. 目录结构

```text
webgis-crane-system/
|-- index.html
|-- dashboard.html
|-- css/style.css
|-- js/
|   |-- config.js
|   |-- main.js
|   |-- layers.js
|   |-- query.js
|   |-- edit.js
|   |-- renderers.js
|   |-- gpAnalysis.js
|   |-- animation.js
|   |-- gpsReplay.js
|   |-- dashboard.js
|   `-- demoData.js
|-- data/
|   |-- migration_nodes.geojson
|   |-- migration_corridors.geojson
|   |-- wind_farms.geojson
|   |-- powerlines.geojson
|   |-- conservation_notes.geojson
|   `-- gps_stream_demo.json
|-- server/gp-server.js
|-- geoserver/
`-- vendor/
```

## 3. 已实现功能

- 启动页：首页先展示“飞越风与电”，可进入分析系统、打开数据大屏、启动演示模式。
- 默认底图：天地图矢量 WMTS + 暗色低饱和滤镜，不加载注记层；项目内自制生态底图作为网络失败时的兜底背景。
- 图层：迁徙节点、迁徙廊道、风电场、输电线路、保护建议/风险标注。
- 查询：节点查询、廊道查询、高风险廊道筛选、保护建议查询。
- 编辑：保护建议点新增、属性修改、删除、导出 GeoJSON。
- 渲染：节点风险/重要性、廊道成本变化/风险、保护建议优先级。
- 节点周边基础设施压力分析：统一入口为 `executeGPAnalysis()`。
- 阻断效应演示：保留 Step 演示和高风险廊道逐条高亮动画。
- 一键演示：按节点、廊道、设施、高风险、保护建议、节点压力分析、模拟 GPS、大屏提示的顺序运行。
- 数据大屏：自动统计节点、廊道、高风险廊道、风电设施、输电线路长度、保护建议点、风险等级和成本变化分组。
- 模拟 GPS 轨迹回放：主系统和大屏均可开始、暂停、重置，移动点和滚动播报使用 `data/gps_stream_demo.json`。
- 面板折叠：主系统工具面板、结果面板和大屏统计卡片均可收起/展开。

## 4. 真实实现与模拟演示边界

真实实现：

- 本地 GeoJSON 图层加载与 OpenLayers 地图展示。
- 图层显隐、图例、点击弹窗、查询结果定位与高亮。
- `conservation_notes` 前端内存编辑与 GeoJSON 导出。
- Turf/Node GP 节点周边基础设施压力计算。
- GeoServer WMS/WFS/WPS 服务可访问性检查。
- 数据大屏统计值基于当前 GeoJSON 自动计算。

模拟演示：

- `data/gps_stream_demo.json` 是模拟 GPS 轨迹回放，不是真实实时 GPS。
- 当前数据是白枕鹤春季迁徙网络示范数据，不是多鸟类实测数据库。
- 保护建议编辑默认只保存在前端内存，导出后需人工替换或发布到服务端。
- WPS 当前用于可选的 `JTS:buffer` 缓冲调用；完整“节点压力”仍由 Node GP 或 Turf 计算。

## 5. GP / WPS 兜底链路

前端统一入口：

```js
window.CraneGP.executeGPAnalysis(pointGeometry, radiusKm)
```

执行顺序：

1. `USE_WPS: true` 时，尝试调用 GeoServer WPS `JTS:buffer` 生成缓冲区。
2. WPS 不可用或浏览器跨域失败时，尝试 Node GP。
3. Node GP 不可用时，使用前端 Turf.js 兜底。

默认配置仍保持稳定演示优先：

```js
USE_GEOSERVER: false,
USE_WPS: false,
USE_NODE_GP: false
```

如需优先调用 Node GP：

```js
USE_NODE_GP: true
```

如需尝试 WPS：

```js
USE_WPS: true
USE_NODE_GP: true
```

## 6. GeoServer / WPS 当前状态

本机检查日期：2026-05-06。

- GeoServer 地址：`http://localhost:8080/geoserver`
- GeoServer 版本：`2.28.3`
- WMS GetCapabilities：可访问
- WFS GetCapabilities：可访问
- WPS GetCapabilities：可访问
- WPS 插件：已下载并安装同版本 `geoserver-2.28.3-wps-plugin.zip`
- 插件下载保存位置：`geoserver/extensions/geoserver-2.28.3-wps-plugin.zip`
- 插件解压位置：`geoserver/extensions/wps-2.28.3/`
- GeoServer lib 位置：`D:\geosever\webapps\geoserver\WEB-INF\lib`

安装说明：

1. 已确认 GeoServer 主 jar 为 `gs-main-2.28.3.jar`。
2. 已复制 9 个 WPS 相关 jar 到 `WEB-INF/lib`。
3. `shutdown.bat` 被系统应用控制策略拦截，已改用 Java 直连停止/启动。
4. 重启后已验证 `http://localhost:8080/geoserver/ows?service=WPS&request=GetCapabilities` 返回 WPS 能力文档。
5. 已验证 WPS `JTS:buffer` 可返回 GeoJSON Polygon。

后续如果需要重新启动 GeoServer，可使用同等 Java 启动方式，或修复本机对 `shutdown.bat/startup.bat` 的应用控制拦截。

## 7. 需要后续替换的服务地址

集中在 `js/config.js`：

- `GEOSERVER_BASE_URL`
- `WMS_URL`
- `WFS_URL`
- `WPS_URL`
- `NODE_GP_URL`
- `GPS_STREAM_URL`

如果将课程数据正式发布到 GeoServer，建议保持 workspace 为：

```text
crane_webgis
```

图层名称保持：

```text
migration_nodes
migration_corridors
wind_farms
powerlines
conservation_notes
```
