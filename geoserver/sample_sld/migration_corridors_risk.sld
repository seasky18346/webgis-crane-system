<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>migration_corridors_risk</Name>
    <UserStyle>
      <Title>Migration corridors by risk level</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>low</Name>
          <Title>低风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>低</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <LineSymbolizer><Stroke><CssParameter name="stroke">#2e7d32</CssParameter><CssParameter name="stroke-width">2</CssParameter></Stroke></LineSymbolizer>
        </Rule>
        <Rule>
          <Name>medium</Name>
          <Title>中风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>中</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <LineSymbolizer><Stroke><CssParameter name="stroke">#d79217</CssParameter><CssParameter name="stroke-width">3</CssParameter></Stroke></LineSymbolizer>
        </Rule>
        <Rule>
          <Name>high</Name>
          <Title>高风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>高</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <LineSymbolizer><Stroke><CssParameter name="stroke">#c62828</CssParameter><CssParameter name="stroke-width">5</CssParameter></Stroke></LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
