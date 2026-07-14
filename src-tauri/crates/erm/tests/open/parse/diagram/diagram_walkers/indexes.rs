use pretty_assertions::assert_eq;

use erm::dtos::diagram::diagram_walkers::tables::indexes;
use erm::open;

use super::support;

#[test]
fn indexes_receive_identity_keys_when_opened() {
    let diagram = open(support::DIAGRAM_WALKERS_DETAILS_FIXTURE).expect("failed to parse");
    let indexes = diagram
        .diagram_walkers
        .as_ref()
        .and_then(|walkers| walkers.tables.as_ref())
        .and_then(|tables| tables.first())
        .and_then(|table| table.indexes.as_ref())
        .expect("missing indexes");

    assert!(!indexes.is_empty());
    assert!(indexes.iter().all(|index| index.identity_key.is_some()));
}

#[test]
fn indexes_tags_keep_valid_values() {
    let table = support::first_table();

    assert_eq!(
        table.indexes,
        Some(vec![
            indexes::Index {
                name: "IDX_MEMBERS_NAME".to_string(),
                index_type: "BTREE".to_string(),
                description: Some("Name lookup".to_string()),
                full_text: Some(false),
                non_unique: Some(true),
                columns: vec![
                    indexes::Column {
                        column_id: "MEMBER_NAME".to_string(),
                        desc: Some(true),
                    },
                    indexes::Column {
                        column_id: "MEMBER_ID".to_string(),
                        desc: None,
                    },
                ],
            }
            .into()
        ])
    );
}

#[test]
fn full_text_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<full_text>false</full_text>",
        "<full_text>no</full_text>",
        "index_full_text",
    );
}

#[test]
fn non_unique_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<non_unique>true</non_unique>",
        "<non_unique>yes</non_unique>",
        "index_non_unique",
    );
}

#[test]
fn desc_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<desc>true</desc>",
        "<desc>descending</desc>",
        "index_desc",
    );
}
