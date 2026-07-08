use erm::dtos::diagram;
use erm::dtos::diagram::column_groups;
use erm::dtos::diagram::diagram_walkers;
use erm::dtos::diagram::diagram_walkers::tables;
use erm::dtos::diagram::diagram_walkers::tables::columns;
use erm::dtos::diagram::diagram_walkers::tables::compound_unique_key_list;
use erm::dtos::diagram::diagram_walkers::tables::connections;
use erm::dtos::diagram::diagram_walkers::tables::indexes;

use crate::write;

pub(super) const DETAILS_FIXTURE: &str =
    include_str!("../../../fixtures/diagram/diagram_walkers_details.erm");

pub(super) fn diagram() -> diagram::Diagram {
    diagram::Diagram {
        identity_key: None,
        diagram_walkers: Some(diagram_walkers::DiagramWalkers {
            identity_key: None,
            tables: Some(vec![members_table(), parent_members_table()]),
        }),
        column_groups: Some(vec![column_groups::ColumnGroup {
            identity_key: None,
            column_group_name: "COMMON_COLUMNS".to_string(),
            columns: column_groups::Columns {
                identity_key: None,
                normal_columns: Some(vec![column_groups::NormalColumn {
                    identity_key: None,
                    physical_name: "CREATED_AT".to_string(),
                    column_type: column_groups::ColumnType::Datetime,
                    ..Default::default()
                }]),
            },
        }]),
        ..write::support::minimal_diagram()
    }
}

fn members_table() -> tables::Table {
    tables::Table {
        identity_key: None,
        physical_name: "MEMBERS".to_string(),
        logical_name: "Members".to_string(),
        description: "Member master table".to_string(),
        height: Some(108),
        width: Some(194),
        font_name: "Ubuntu".to_string(),
        font_size: 9,
        x: 160,
        y: 106,
        color: tables::Color {
            identity_key: None,
            r: 128,
            g: 129,
            b: 130,
        },
        connections: connections::Connections {
            identity_key: None,
            relationships: Some(vec![connections::Relationship {
                identity_key: None,
                name: "FK_MEMBERS_PARENT".to_string(),
                source: "table.PARENT_MEMBERS".to_string(),
                target: "table.MEMBERS".to_string(),
                bendpoints: Some(vec![connections::Bendpoint {
                    identity_key: None,
                    relative: true,
                    x: 11,
                    y: 12,
                }]),
                fk_columns: connections::FkColumns {
                    identity_key: None,
                    fk_column: vec![connections::FkColumn {
                        identity_key: None,
                        fk_column_name: "MEMBER_ID".to_string(),
                    }],
                },
                parent_cardinality: connections::ParentCardinality::ZeroOrOne,
                child_cardinality: connections::ChildCardinality::ZeroOrMore,
                reference_for_pk: false,
                on_delete_action: Some(connections::OnAction::Cascade),
                on_update_action: Some(connections::OnAction::Restrict),
                referred_simple_unique_column: Some(
                    "table.PARENT_MEMBERS.PARENT_MEMBER_CODE".to_string(),
                ),
                referred_compound_unique_key: None,
            }]),
        },
        table_constraint: Some("ENGINE=InnoDB".to_string()),
        primary_key_name: Some("PK_MEMBERS".to_string()),
        option: Some("member option".to_string()),
        columns: columns::Columns {
            identity_key: None,
            items: Some(vec![
                columns::ColumnItem::Normal(columns::NormalColumn {
                    identity_key: None,
                    physical_name: "MEMBER_ID".to_string(),
                    logical_name: Some("Member ID".to_string()),
                    description: Some("Surrogate key".to_string()),
                    column_type: Some(columns::ColumnType::DecimalPS),
                    length: Some(18),
                    decimal: Some(0),
                    args: Some("UNSIGNED".to_string()),
                    unsigned: Some(true),
                    not_null: Some(true),
                    unique_key: Some(true),
                    default_value: Some("0".to_string()),
                    primary_key: Some(true),
                    auto_increment: Some(true),
                    referred_column: Some("table.PARENT_MEMBERS.PARENT_MEMBER_ID".to_string()),
                    relationship: Some("FK_MEMBERS_PARENT".to_string()),
                }),
                columns::ColumnItem::Normal(columns::NormalColumn {
                    identity_key: None,
                    physical_name: "MEMBER_NAME".to_string(),
                    ..Default::default()
                }),
                columns::ColumnItem::Group("COMMON_COLUMNS".to_string()),
            ]),
        },
        indexes: Some(vec![indexes::Index {
            identity_key: None,
            name: "IDX_MEMBERS_NAME".to_string(),
            index_type: "BTREE".to_string(),
            description: Some("Name lookup".to_string()),
            full_text: Some(false),
            non_unique: Some(true),
            columns: vec![
                indexes::Column {
                    identity_key: None,
                    column_id: "MEMBER_NAME".to_string(),
                    desc: Some(true),
                },
                indexes::Column {
                    identity_key: None,
                    column_id: "MEMBER_ID".to_string(),
                    desc: None,
                },
            ],
        }]),
        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
            identity_key: None,
            compound_unique_keys: Some(vec![compound_unique_key_list::CompoundUniqueKey {
                identity_key: None,
                name: "UK_MEMBERS_NAME".to_string(),
                columns: vec![
                    compound_unique_key_list::Column {
                        identity_key: None,
                        column_id: "MEMBER_NAME".to_string(),
                    },
                    compound_unique_key_list::Column {
                        identity_key: None,
                        column_id: "MEMBER_ID".to_string(),
                    },
                ],
            }]),
        },
    }
}

fn parent_members_table() -> tables::Table {
    tables::Table {
        identity_key: None,
        physical_name: "PARENT_MEMBERS".to_string(),
        logical_name: "Parent Members".to_string(),
        description: "Parent member table".to_string(),
        height: None,
        width: None,
        font_name: "Ubuntu".to_string(),
        font_size: 9,
        x: 420,
        y: 106,
        color: tables::Color {
            identity_key: None,
            r: 128,
            g: 129,
            b: 130,
        },
        connections: connections::Connections {
            identity_key: None,
            relationships: None,
        },
        table_constraint: None,
        primary_key_name: None,
        option: None,
        columns: columns::Columns {
            identity_key: None,
            items: Some(vec![
                columns::ColumnItem::Normal(columns::NormalColumn {
                    identity_key: None,
                    physical_name: "PARENT_MEMBER_ID".to_string(),
                    ..Default::default()
                }),
                columns::ColumnItem::Normal(columns::NormalColumn {
                    identity_key: None,
                    physical_name: "PARENT_MEMBER_CODE".to_string(),
                    unique_key: Some(true),
                    ..Default::default()
                }),
            ]),
        },
        indexes: None,
        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
            identity_key: None,
            compound_unique_keys: Some(vec![compound_unique_key_list::CompoundUniqueKey {
                identity_key: None,
                name: "UK_PARENT_MEMBERS_CODE".to_string(),
                columns: vec![compound_unique_key_list::Column {
                    identity_key: None,
                    column_id: "PARENT_MEMBER_CODE".to_string(),
                }],
            }]),
        },
    }
}
