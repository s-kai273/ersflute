use pretty_assertions::assert_eq;

use erm::entities::{
    CGColumns, CGNormalColumn, Color, ColumnGroup, ColumnGroups, Columns, Connections, Diagram,
    DiagramSettings, DiagramWalkers, FkColumn, FkColumns, NormalColumn, Relationship, Table,
};
use erm::open;

// TODO: Add test cases of detailed condition for each field in https://github.com/s-kai273/ersflute/issues/22

#[test]
fn test_read_erm_file() {
    let diagram = open("./tests/fixtures/testerd.erm").expect("failed to parse");
    assert_eq!(
        diagram,
        Diagram {
            diagram_settings: DiagramSettings {
                database: "MySQL".to_string(),
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
                            relationship: vec![],
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    logical_name: "会員ID".to_string(),
                                    column_type: "bigint".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "LAST_NAME".to_string(),
                                    logical_name: "苗字".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: Some(32),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "FIRST_NAME".to_string(),
                                    logical_name: "名前".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: Some(32),
                                    not_null: true,
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec!["COMMON".to_string()],
                        },
                    },
                    Table {
                        physical_name: "MEMBER_PROFILES".to_string(),
                        logical_name: "会員プロフィール".to_string(),
                        description: "".to_string(),
                        height: 161,
                        width: 245,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 502,
                        y: 103,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![
                                Relationship {
                                    name: "FK_MEMBER_PROFILES_MEMBERS".to_string(),
                                    source: "table.MEMBERS".to_string(),
                                    target: "table.MEMBER_PROFILES".to_string(),
                                    fk_columns: FkColumns {
                                        fk_column: vec![FkColumn {
                                            fk_column_name: "MEMBER_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "0..1".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: "RESTRICT".to_string(),
                                    on_update_action: "RESTRICT".to_string(),
                                },
                                Relationship {
                                    name: "FK_MEMBER_PROFILES_MST_GENDER".to_string(),
                                    source: "table.MST_GENDER".to_string(),
                                    target: "table.MEMBER_PROFILES".to_string(),
                                    fk_columns: FkColumns {
                                        fk_column: vec![FkColumn {
                                            fk_column_name: "GENDER_ID".to_string(),
                                        }]
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "0..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: "RESTRICT".to_string(),
                                    on_update_action: "RESTRICT".to_string(),
                                }
                            ]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "MEMBER_PROFILE_ID".to_string(),
                                    logical_name: "会員プロフィールID".to_string(),
                                    column_type: "bigint".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
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
                                NormalColumn {
                                    physical_name: "PROFILE_IMG_URL".to_string(),
                                    logical_name: "プロフィール画像URL".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: Some(2048),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "GENDER_ID".to_string(),
                                    referred_column: "table.MST_GENDER.GENDER_ID".to_string(),
                                    relationship: "FK_MEMBER_PROFILES_MST_GENDER".to_string(),
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec!["COMMON".to_string()],
                        }
                    },
                    Table {
                        physical_name: "MST_GENDER".to_string(),
                        logical_name: "マスター性別".to_string(),
                        description: "".to_string(),
                        height: 75,
                        width: 190,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 829,
                        y: 99,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![],
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "GENDER_ID".to_string(),
                                    logical_name: "性別ID".to_string(),
                                    column_type: "integer".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "GENDER".to_string(),
                                    logical_name: "性別".to_string(),
                                    column_type: "character(n)".to_string(),
                                    length: Some(2),
                                    description: "「男性」または「女性」".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec![],
                        }
                    },
                    Table {
                        physical_name: "POSTS".to_string(),
                        logical_name: "投稿".to_string(),
                        description: "".to_string(),
                        height: 233,
                        width: 215,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 159,
                        y: 364,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![Relationship {
                                name: "FK_MEMBER_POSTS_MEMBERS".to_string(),
                                source: "table.MEMBERS".to_string(),
                                target: "table.POSTS".to_string(),
                                fk_columns: FkColumns {
                                    fk_column: vec![FkColumn {
                                        fk_column_name: "MEMBER_ID".to_string(),
                                    }],
                                },
                                parent_cardinality: "0..1".to_string(),
                                child_cardinality: "0..n".to_string(),
                                reference_for_pk: true,
                                on_delete_action: "RESTRICT".to_string(),
                                on_update_action: "RESTRICT".to_string(),
                            },]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "POST_ID".to_string(),
                                    logical_name: "投稿ID".to_string(),
                                    column_type: "bigint".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: "table.MEMBERS.MEMBER_ID".to_string(),
                                    relationship: "FK_MEMBER_POSTS_MEMBERS".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "TITLE".to_string(),
                                    logical_name: "タイトル".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: Some(128),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "TEXT".to_string(),
                                    logical_name: "本文".to_string(),
                                    column_type: "text".to_string(),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "IMG_URL".to_string(),
                                    logical_name: "画像URL".to_string(),
                                    column_type: "varchar(n)".to_string(),
                                    length: Some(2048),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "VIEW_COUNT".to_string(),
                                    logical_name: "閲覧数".to_string(),
                                    column_type: "bigint".to_string(),
                                    not_null: true,
                                    default_value: "0".to_string(),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "LIKE_COUNT".to_string(),
                                    logical_name: "いいね数".to_string(),
                                    column_type: "bigint".to_string(),
                                    not_null: true,
                                    default_value: "0".to_string(),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "PUBLIC_START_AT".to_string(),
                                    logical_name: "公開開始時間".to_string(),
                                    column_type: "datetime".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "PUBLIC_END_AT".to_string(),
                                    logical_name: "公開終了時間".to_string(),
                                    column_type: "datetime".to_string(),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "DELETED".to_string(),
                                    logical_name: "削除済".to_string(),
                                    column_type: "boolean".to_string(),
                                    not_null: true,
                                    default_value: "FALSE".to_string(),
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec!["COMMON".to_string()],
                        },
                    },
                    Table {
                        physical_name: "POST_REPLIES".to_string(),
                        logical_name: "投稿返信".to_string(),
                        description: "".to_string(),
                        height: 75,
                        width: 120,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 782,
                        y: 391,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![
                                Relationship {
                                    name: "FK_POST_REPLIES_POST_THREADS".to_string(),
                                    source: "table.POST_THREADS".to_string(),
                                    target: "table.POST_REPLIES".to_string(),
                                    fk_columns: FkColumns {
                                        fk_column: vec![FkColumn {
                                            fk_column_name: "POST_THREAD_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "1..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: "RESTRICT".to_string(),
                                    on_update_action: "RESTRICT".to_string(),
                                },
                                Relationship {
                                    name: "FK_POST_REPLIES_MEMBERS".to_string(),
                                    source: "table.MEMBERS".to_string(),
                                    target: "table.POST_REPLIES".to_string(),
                                    fk_columns: FkColumns {
                                        fk_column: vec![FkColumn {
                                            fk_column_name: "MEMBER_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "0..1".to_string(),
                                    child_cardinality: "0..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: "RESTRICT".to_string(),
                                    on_update_action: "RESTRICT".to_string(),
                                },
                            ]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "POST_REPLY_ID".to_string(),
                                    logical_name: "投稿返信ID".to_string(),
                                    column_type: "bigint".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "POST_THREAD_ID".to_string(),
                                    referred_column: "table.POST_THREADS.POST_THREAD_ID"
                                        .to_string(),
                                    relationship: "FK_POST_REPLIES_POST_THREADS".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: "table.MEMBERS.MEMBER_ID".to_string(),
                                    relationship: "FK_POST_REPLIES_MEMBERS".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "TEXT".to_string(),
                                    logical_name: "本文".to_string(),
                                    column_type: "text".to_string(),
                                    not_null: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "VIEW_COUNT".to_string(),
                                    logical_name: "閲覧数".to_string(),
                                    column_type: "bigint".to_string(),
                                    not_null: true,
                                    default_value: "0".to_string(),
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "LIKE_COUNT".to_string(),
                                    logical_name: "いいね数".to_string(),
                                    column_type: "bigint".to_string(),
                                    not_null: true,
                                    default_value: "0".to_string(),
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec!["COMMON".to_string()],
                        },
                    },
                    Table {
                        physical_name: "POST_THREADS".to_string(),
                        logical_name: "投稿スレッド".to_string(),
                        description: "".to_string(),
                        height: 75,
                        width: 203,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 481,
                        y: 474,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: Connections {
                            relationship: vec![Relationship {
                                name: "FK_POST_THREADS_MEMBER_POSTS".to_string(),
                                source: "table.POSTS".to_string(),
                                target: "table.POST_THREADS".to_string(),
                                fk_columns: FkColumns {
                                    fk_column: vec![FkColumn {
                                        fk_column_name: "POST_ID".to_string(),
                                    }],
                                },
                                parent_cardinality: "1".to_string(),
                                child_cardinality: "0..1".to_string(),
                                reference_for_pk: true,
                                on_delete_action: "RESTRICT".to_string(),
                                on_update_action: "RESTRICT".to_string(),
                            },]
                        },
                        columns: Columns {
                            normal_columns: vec![
                                NormalColumn {
                                    physical_name: "POST_THREAD_ID".to_string(),
                                    logical_name: "投稿スレッドID".to_string(),
                                    column_type: "bigint".to_string(),
                                    unsigned: true,
                                    not_null: true,
                                    primary_key: true,
                                    auto_increment: true,
                                    ..Default::default()
                                },
                                NormalColumn {
                                    physical_name: "POST_ID".to_string(),
                                    referred_column: "table.POSTS.POST_ID".to_string(),
                                    relationship: "FK_POST_THREADS_MEMBER_POSTS".to_string(),
                                    not_null: true,
                                    unique_key: true,
                                    ..Default::default()
                                },
                            ],
                            column_groups: vec!["COMMON".to_string()],
                        },
                    }
                ],
            },
            column_groups: ColumnGroups {
                column_groups: vec![ColumnGroup {
                    column_group_name: "COMMON".to_string(),
                    columns: CGColumns {
                        normal_columns: vec![
                            CGNormalColumn {
                                physical_name: "CREATED_AT".to_string(),
                                logical_name: "作成時間".to_string(),
                                column_type: "datetime".to_string(),
                                not_null: true,
                                ..Default::default()
                            },
                            CGNormalColumn {
                                physical_name: "CREATED_BY".to_string(),
                                logical_name: "作成会員ID".to_string(),
                                column_type: "bigint".to_string(),
                                not_null: true,
                                ..Default::default()
                            },
                            CGNormalColumn {
                                physical_name: "UPDATED_AT".to_string(),
                                logical_name: "更新時間".to_string(),
                                column_type: "datetime".to_string(),
                                not_null: true,
                                ..Default::default()
                            },
                            CGNormalColumn {
                                physical_name: "UPDATED_BY".to_string(),
                                logical_name: "更新会員ID".to_string(),
                                column_type: "bigint".to_string(),
                                not_null: true,
                                ..Default::default()
                            }
                        ]
                    }
                },]
            }
        }
    )
}
