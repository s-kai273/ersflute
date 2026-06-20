use erm::dtos::diagram::column_groups;

use crate::write::support;

#[test]
fn column_groups_tags_are_serialized() {
    let mut diagram = support::minimal_diagram();
    diagram.column_groups = Some(vec![
        column_groups::ColumnGroup {
            column_group_name: "COMMON".to_string(),
            columns: column_groups::Columns {
                normal_columns: Some(vec![
                    column_groups::NormalColumn {
                        physical_name: "CREATED_AT".to_string(),
                        logical_name: Some("Created At".to_string()),
                        description: Some("Created timestamp".to_string()),
                        column_type: column_groups::ColumnType::DecimalPS,
                        length: Some(6),
                        decimal: Some(0),
                        args: Some("fsp".to_string()),
                        not_null: Some(true),
                        unique_key: Some(false),
                        unsigned: Some(false),
                        default_value: Some("CURRENT_TIMESTAMP".to_string()),
                    },
                    column_groups::NormalColumn {
                        physical_name: "UPDATED_BY".to_string(),
                        column_type: column_groups::ColumnType::BigInt,
                        ..Default::default()
                    },
                ]),
            },
        },
        column_groups::ColumnGroup {
            column_group_name: "AUDIT".to_string(),
            columns: column_groups::Columns {
                normal_columns: None,
            },
        },
    ]);

    support::assert_serialized_element(
        diagram,
        "column_groups",
        "column_groups",
        include_str!("../../fixtures/diagram/column_groups.erm"),
    );
}
