use erm::entities::{
    Color, ColumnGroups, Columns, Connections, Diagram, DiagramSettings, DiagramWalkers, FkColumn,
    FkColumns, NormalColumn, Relationship, Table,
};
use erm::open;

#[test]
fn test_read_erm_file() {
    let diagram = open("./tests/fixtures/testerd.erm").expect("failed to parse");
    assert_eq!(
        diagram,
        Diagram {
            diagram_settings: DiagramSettings {
                database: "MySQL".to_string()
            },
            diagram_walkers: DiagramWalkers {
                tables: vec![
                    Table {
                        physical_name: "MEMBERS".to_string(),
                        logical_name: "会員".to_string(),
                        description: "".to_string(),
                        height: 108,
                        width: 194,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 160,
                        y: 106,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    logical_name: "会員ID".to_string(),
                                    column_type: "bigint".to_string(),
                                    not_null: true,
                                    primary_key: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "LAST_NAME".to_string(),
                                    logical_name: "苗字".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: 0,
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "FIRST_NAME".to_string(),
                                    logical_name: "名前".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: 0,
                                    not_null: true,
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec![],
                        },
                    },
                    Table {
                        physical_name: "MEMBER_PROFILES".to_string(),
                        logical_name: "会員プロフィール".to_string(),
                        description: "".to_string(),
                        height: 89,
                        width: 245,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 488,
                        y: 113,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![Relationship {
                                name: "FK_MEMBER_PROFILES_MEMBERS".to_string(),
                                source: "table.MEMBERS".to_string(),
                                target: "table.MEMBER_PROFILES".to_string(),
                                fk_columns: FkColumns {
                                    fk_column: vec![FkColumn {
                                        fk_column_name: "MEMBER_ID".to_string(),
                                    }],
                                },
                                parent_cardinality: "1".to_string(),
                                child_cardinality: "1".to_string(),
                                reference_for_pk: true,
                                on_delete_action: "RESTRICT".to_string(),
                                on_update_action: "RESTRICT".to_string(),
                            }]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "MEMBER_PROFILE_ID".to_string(),
                                    logical_name: "会員プロフィールID".to_string(),
                                    column_type: "bigint(n)".to_string(),
                                    length: 0,
                                    not_null: true,
                                    primary_key: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: "table.MEMBERS.MEMBER_ID".to_string(),
                                    relationship: "FK_MEMBER_PROFILES_MEMBERS".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "SELF_INTRODUCTION".to_string(),
                                    logical_name: "自己紹介".to_string(),
                                    column_type: "text".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec![],
                        }
                    }
                ]
            },
            column_groups: ColumnGroups {
                column_groups: vec![]
            }
        }
    )
}
