# GeoServer 发布说明

当前本机审查结果：

- GeoServer 可访问：`http://localhost:8080/geoserver`
- 版本：`2.28.3`
- WMS：GetCapabilities 可访问
- WFS：GetCapabilities 可访问
- WPS：2026-05-06 已安装同版本 `2.28.3` WPS 插件，GetCapabilities 可访问
- Docker：当前命令行未检测到
- npm：当前命令行未检测到

建议课程演示优先使用默认的本地 GeoJSON 模式。需要切换 GeoServer 时，建议按下面步骤发布。

## 工作空间

创建 workspace：

- 名称：`crane_webgis`
- 命名空间 URI：`http://localhost:8080/geoserver/crane_webgis`

## 图层

发布以下图层，名称保持一致：

- `migration_nodes`
- `migration_corridors`
- `wind_farms`
- `powerlines`
- `conservation_notes`

开发数据位于 `../data/*.geojson`。如果使用 Shapefile，注意 DBF 字段名长度会被截断；如果要保留完整字段名，优先使用 PostGIS 或 GeoPackage。

## 服务地址

前端配置集中在 `../js/config.js`：

- `USE_GEOSERVER`
- `USE_WPS`
- `USE_NODE_GP`
- `GEOSERVER_BASE_URL`
- `GEOSERVER_WORKSPACE`
- `WMS_URL`
- `WFS_URL`
- `WPS_URL`
- `NODE_GP_URL`

GeoServer 发布完成后，将 `USE_GEOSERVER` 改为 `true`，前端会优先通过 WFS GeoJSON 读取同名图层。

## WFS-T

`conservation_notes` 是唯一允许编辑的图层。当前前端默认采用内存编辑并导出 GeoJSON。

若要启用 WFS-T：

1. 确认 `conservation_notes` 所在数据源可写。
2. 在 GeoServer 中启用 WFS Transaction。
3. 处理浏览器跨域与认证。
4. 在 `../js/edit.js` 的 `saveEditsToWFST()` 中补充 Transaction Insert/Update/Delete。

## WPS

当前 GeoServer 已启用 WPS。若需要重新配置 WPS：

1. 确认 GeoServer 版本为 `2.28.3`。
2. 下载完全同版本的 `geoserver-2.28.3-wps-plugin.zip`。
3. 解压 jar 到 GeoServer 的 `WEB-INF/lib`。
4. 重启 GeoServer。
5. 访问 WPS GetCapabilities 验证。

当前前端默认仍优先保持课程演示稳定。`js/config.js` 中 `USE_WPS: true` 时，会尝试调用 GeoServer WPS `JTS:buffer`；如 WPS 或跨域不可用，课程演示直接使用 `server/gp-server.js` 或前端 Turf 方案即可。
