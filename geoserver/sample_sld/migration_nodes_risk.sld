<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>migration_nodes_risk</Name>
    <UserStyle>
      <Title>Migration nodes by risk level</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>low</Name>
          <Title>低风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>低</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#2e7d32</CssParameter></Fill><Stroke><CssParameter name="stroke">#ffffff</CssParameter><CssParameter name="stroke-width">1.5</CssParameter></Stroke></Mark>
              <Size>9</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        <Rule>
          <Name>medium</Name>
          <Title>中风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>中</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#d79217</CssParameter></Fill><Stroke><CssParameter name="stroke">#ffffff</CssParameter><CssParameter name="stroke-width">1.5</CssParameter></Stroke></Mark>
              <Size>11</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        <Rule>
          <Name>high</Name>
          <Title>高风险</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>risk_level</ogc:PropertyName><ogc:Literal>高</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#c62828</CssParameter></Fill><Stroke><CssParameter name="stroke">#ffffff</CssParameter><CssParameter name="stroke-width">2</CssParameter></Stroke></Mark>
              <Size>13</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
