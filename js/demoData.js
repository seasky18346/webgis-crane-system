window.CraneEmbeddedData = {
  "migration_nodes": {
    "type": "FeatureCollection",
    "name": "migration_nodes",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "node_id": "N01",
          "node_name": "鄱阳湖越冬集结区",
          "node_type": "核心停歇节点",
          "stopover_count": 18,
          "individual_count": 12,
          "mean_duration": 7.8,
          "pagerank": 0.18,
          "risk_level": "中",
          "remark": "春季北迁起点示意节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            116.29,
            29.08
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N02",
          "node_name": "黄河三角洲停歇区",
          "node_type": "核心停歇节点",
          "stopover_count": 15,
          "individual_count": 10,
          "mean_duration": 5.6,
          "pagerank": 0.16,
          "risk_level": "中",
          "remark": "滨海湿地停歇节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            118.95,
            37.75
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N03",
          "node_name": "渤海湾北岸节点",
          "node_type": "一般停歇节点",
          "stopover_count": 9,
          "individual_count": 7,
          "mean_duration": 3.2,
          "pagerank": 0.09,
          "risk_level": "低",
          "remark": "海岸带连接节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            117.72,
            39.05
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N04",
          "node_name": "辽西丘陵湿地节点",
          "node_type": "连接节点",
          "stopover_count": 7,
          "individual_count": 5,
          "mean_duration": 2.4,
          "pagerank": 0.11,
          "risk_level": "高",
          "remark": "廊道转折区，邻近风电和输电设施"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            120.85,
            41.35
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N05",
          "node_name": "科尔沁草原停歇区",
          "node_type": "核心停歇节点",
          "stopover_count": 16,
          "individual_count": 11,
          "mean_duration": 6.4,
          "pagerank": 0.21,
          "risk_level": "高",
          "remark": "春迁网络关键节点，基础设施压力较高"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            122.25,
            44.35
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N06",
          "node_name": "达里诺尔湖节点",
          "node_type": "一般停歇节点",
          "stopover_count": 8,
          "individual_count": 6,
          "mean_duration": 3.6,
          "pagerank": 0.08,
          "risk_level": "中",
          "remark": "内蒙古中部替代停歇节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            116.65,
            43.28
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N07",
          "node_name": "呼伦湖湿地节点",
          "node_type": "核心停歇节点",
          "stopover_count": 14,
          "individual_count": 9,
          "mean_duration": 5.2,
          "pagerank": 0.14,
          "risk_level": "中",
          "remark": "中俄蒙交界区域重要停歇节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            117.52,
            48.95
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N08",
          "node_name": "鄂嫩河流域节点",
          "node_type": "连接节点",
          "stopover_count": 5,
          "individual_count": 4,
          "mean_duration": 2.1,
          "pagerank": 0.06,
          "risk_level": "低",
          "remark": "蒙古国东北部连接节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            111.55,
            49.02
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N09",
          "node_name": "东方省湿地节点",
          "node_type": "一般停歇节点",
          "stopover_count": 10,
          "individual_count": 8,
          "mean_duration": 4.1,
          "pagerank": 0.1,
          "risk_level": "高",
          "remark": "邻近跨境基础设施走廊"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            114.35,
            47.75
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "node_id": "N10",
          "node_name": "黑龙江中游繁殖前节点",
          "node_type": "核心停歇节点",
          "stopover_count": 13,
          "individual_count": 9,
          "mean_duration": 5.9,
          "pagerank": 0.15,
          "risk_level": "中",
          "remark": "进入繁殖区前的北部关键节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            128.4,
            49.2
          ]
        }
      }
    ]
  },
  "migration_corridors": {
    "type": "FeatureCollection",
    "name": "migration_corridors",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E01",
          "from_node": "N01",
          "to_node": "N02",
          "baseline_cost": 120,
          "infra_cost": 138,
          "cost_change": 18,
          "cost_change_pct": 15,
          "corridor_type": "主廊道",
          "risk_level": "中",
          "remark": "越冬区至黄河三角洲的北迁通道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              116.29,
              29.08
            ],
            [
              117.1,
              33.2
            ],
            [
              118.95,
              37.75
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E02",
          "from_node": "N02",
          "to_node": "N03",
          "baseline_cost": 62,
          "infra_cost": 68,
          "cost_change": 6,
          "cost_change_pct": 9.7,
          "corridor_type": "一般廊道",
          "risk_level": "低",
          "remark": "滨海湿地短距离连接"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              118.95,
              37.75
            ],
            [
              118.55,
              38.5
            ],
            [
              117.72,
              39.05
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E03",
          "from_node": "N03",
          "to_node": "N04",
          "baseline_cost": 88,
          "infra_cost": 125,
          "cost_change": 37,
          "cost_change_pct": 42,
          "corridor_type": "高风险廊道",
          "risk_level": "高",
          "remark": "进入辽西丘陵前受设施干扰增强"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              117.72,
              39.05
            ],
            [
              119,
              40.25
            ],
            [
              120.85,
              41.35
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E04",
          "from_node": "N04",
          "to_node": "N05",
          "baseline_cost": 80,
          "infra_cost": 132,
          "cost_change": 52,
          "cost_change_pct": 65,
          "corridor_type": "高风险廊道",
          "risk_level": "高",
          "remark": "风电场与输电线路叠加影响明显"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              120.85,
              41.35
            ],
            [
              121.45,
              42.65
            ],
            [
              122.25,
              44.35
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E05",
          "from_node": "N04",
          "to_node": "N06",
          "baseline_cost": 75,
          "infra_cost": 95,
          "cost_change": 20,
          "cost_change_pct": 26.7,
          "corridor_type": "一般廊道",
          "risk_level": "中",
          "remark": "向内蒙古中部的替代通道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              120.85,
              41.35
            ],
            [
              118.6,
              42.4
            ],
            [
              116.65,
              43.28
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E06",
          "from_node": "N05",
          "to_node": "N07",
          "baseline_cost": 96,
          "infra_cost": 151,
          "cost_change": 55,
          "cost_change_pct": 57.3,
          "corridor_type": "高风险廊道",
          "risk_level": "高",
          "remark": "科尔沁至呼伦湖方向设施压力较高"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              122.25,
              44.35
            ],
            [
              121,
              46.1
            ],
            [
              117.52,
              48.95
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E07",
          "from_node": "N06",
          "to_node": "N08",
          "baseline_cost": 82,
          "infra_cost": 106,
          "cost_change": 24,
          "cost_change_pct": 29.3,
          "corridor_type": "一般廊道",
          "risk_level": "中",
          "remark": "绕行蒙古国东北部的低密度通道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              116.65,
              43.28
            ],
            [
              114,
              46.2
            ],
            [
              111.55,
              49.02
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E08",
          "from_node": "N08",
          "to_node": "N09",
          "baseline_cost": 48,
          "infra_cost": 62,
          "cost_change": 14,
          "cost_change_pct": 29.2,
          "corridor_type": "一般廊道",
          "risk_level": "中",
          "remark": "跨境湿地间连接"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              111.55,
              49.02
            ],
            [
              113,
              48.4
            ],
            [
              114.35,
              47.75
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E09",
          "from_node": "N09",
          "to_node": "N10",
          "baseline_cost": 118,
          "infra_cost": 178,
          "cost_change": 60,
          "cost_change_pct": 50.8,
          "corridor_type": "高风险廊道",
          "risk_level": "高",
          "remark": "东方省至黑龙江中游方向高风险连接"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              114.35,
              47.75
            ],
            [
              119.8,
              48.7
            ],
            [
              124.2,
              49.1
            ],
            [
              128.4,
              49.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E10",
          "from_node": "N07",
          "to_node": "N10",
          "baseline_cost": 74,
          "infra_cost": 96,
          "cost_change": 22,
          "cost_change_pct": 29.7,
          "corridor_type": "主廊道",
          "risk_level": "中",
          "remark": "呼伦湖至黑龙江中游的北部主通道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              117.52,
              48.95
            ],
            [
              121.6,
              49
            ],
            [
              128.4,
              49.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E11",
          "from_node": "N05",
          "to_node": "N09",
          "baseline_cost": 90,
          "infra_cost": 132,
          "cost_change": 42,
          "cost_change_pct": 46.7,
          "corridor_type": "高风险廊道",
          "risk_level": "高",
          "remark": "科尔沁至东方省方向的斜向连接"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              122.25,
              44.35
            ],
            [
              119.5,
              45.5
            ],
            [
              116.2,
              46.6
            ],
            [
              114.35,
              47.75
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "edge_id": "E12",
          "from_node": "N02",
          "to_node": "N04",
          "baseline_cost": 100,
          "infra_cost": 122,
          "cost_change": 22,
          "cost_change_pct": 22,
          "corridor_type": "主廊道",
          "risk_level": "中",
          "remark": "黄河三角洲至辽西的内陆连接"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              118.95,
              37.75
            ],
            [
              119.9,
              39.4
            ],
            [
              120.85,
              41.35
            ]
          ]
        }
      }
    ]
  },
  "wind_farms": {
    "type": "FeatureCollection",
    "name": "wind_farms",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W01",
          "name": "张北示意风电场",
          "infra_type": "风电",
          "pressure_level": "中",
          "remark": "演示用点位"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            114.75,
            41.15
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W02",
          "name": "赤峰北部风电场",
          "infra_type": "风电",
          "pressure_level": "中",
          "remark": "靠近内蒙古中部替代廊道"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            118.8,
            42.25
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W03",
          "name": "通辽西部风电场",
          "infra_type": "风电",
          "pressure_level": "高",
          "remark": "靠近科尔沁高风险节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            121.85,
            43.9
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W04",
          "name": "兴安南部风电场",
          "infra_type": "风电",
          "pressure_level": "高",
          "remark": "位于 N05-N07 廊道附近"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            121.15,
            46.05
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W05",
          "name": "东方省风电场",
          "infra_type": "风电",
          "pressure_level": "高",
          "remark": "靠近跨境风险廊道"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            114.65,
            47.55
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W06",
          "name": "呼伦贝尔东部风电场",
          "infra_type": "风电",
          "pressure_level": "中",
          "remark": "靠近北部主通道"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            119.05,
            49.15
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W07",
          "name": "辽西山地风电场",
          "infra_type": "风电",
          "pressure_level": "高",
          "remark": "靠近辽西丘陵湿地节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            120.45,
            41.65
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "W08",
          "name": "科尔沁东缘风电场",
          "infra_type": "风电",
          "pressure_level": "高",
          "remark": "靠近 N05 高风险节点"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            123.35,
            44.85
          ]
        }
      }
    ]
  },
  "powerlines": {
    "type": "FeatureCollection",
    "name": "powerlines",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P01",
          "name": "冀辽跨区输电线路",
          "voltage": "500kV",
          "pressure_level": "中",
          "remark": "穿越渤海湾至辽西连接区"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              117.4,
              39.6
            ],
            [
              119.2,
              40.4
            ],
            [
              121,
              41.55
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P02",
          "name": "赤峰至通辽输电线路",
          "voltage": "500kV",
          "pressure_level": "高",
          "remark": "靠近 E04 高风险廊道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              118.3,
              42.1
            ],
            [
              120.2,
              43
            ],
            [
              122.45,
              44.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P03",
          "name": "通辽至兴安输电线路",
          "voltage": "220kV",
          "pressure_level": "高",
          "remark": "邻近科尔沁至呼伦湖廊道"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              122.1,
              44.3
            ],
            [
              121.8,
              45.4
            ],
            [
              121.05,
              46.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P04",
          "name": "东方省跨境输电线路",
          "voltage": "220kV",
          "pressure_level": "高",
          "remark": "靠近 N09 和 E09"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              113.7,
              47.2
            ],
            [
              115.2,
              47.8
            ],
            [
              117.4,
              48.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P05",
          "name": "呼伦贝尔北部输电线路",
          "voltage": "500kV",
          "pressure_level": "中",
          "remark": "北部主通道附近"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              116.8,
              48.6
            ],
            [
              119.4,
              49.1
            ],
            [
              122.2,
              49.2
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "infra_id": "P06",
          "name": "滨海开发区输电线路",
          "voltage": "220kV",
          "pressure_level": "低",
          "remark": "靠近黄河三角洲北迁起始段"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [
              117.8,
              37.4
            ],
            [
              118.8,
              38
            ],
            [
              119.5,
              38.7
            ]
          ]
        }
      }
    ]
  },
  "conservation_notes": {
    "type": "FeatureCollection",
    "name": "conservation_notes",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "note_id": "C01",
          "name": "辽西廊道核查点",
          "note_type": "人工核查点",
          "priority": "高",
          "suggestion": "建议优先核查风电场与廊道交汇区，评估季节性停机或警示措施。",
          "editor": "课程演示",
          "edit_date": "2026-05-05",
          "remark": "对应 N04 周边高风险区"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            120.65,
            41.55
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "note_id": "C02",
          "name": "科尔沁候选保护地",
          "note_type": "候选保护地",
          "priority": "高",
          "suggestion": "建议围绕核心停歇湿地建立廊道缓冲管理区。",
          "editor": "课程演示",
          "edit_date": "2026-05-05",
          "remark": "靠近 N05"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            122.05,
            44.55
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "note_id": "C03",
          "name": "达里诺尔替代通道保护建议",
          "note_type": "保护建议点",
          "priority": "中",
          "suggestion": "维持低干扰湿地斑块，作为高压廊道的替代停歇节点。",
          "editor": "课程演示",
          "edit_date": "2026-05-05",
          "remark": "中等优先级"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            116.9,
            43.45
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "note_id": "C04",
          "name": "东方省风险标注",
          "note_type": "风险标注点",
          "priority": "高",
          "suggestion": "建议补充跨境设施资料，识别 E09 廊道的局部瓶颈。",
          "editor": "课程演示",
          "edit_date": "2026-05-05",
          "remark": "靠近 N09"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            114.45,
            47.65
          ]
        }
      }
    ]
  }
};
