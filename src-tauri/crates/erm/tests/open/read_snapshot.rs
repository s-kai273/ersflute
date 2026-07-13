use pretty_assertions::assert_eq;

#[path = "../support/snapshot_diagram.rs"]
mod snapshot_diagram;

use erm::open;

use crate::open::support;

#[test]
fn test_read_snapshot() {
    let mut diagram = open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse");
    assert_all_repeated_elements_have_identity_keys(&diagram);
    support::clear_identity_keys(&mut diagram);
    assert_eq!(diagram, snapshot_diagram::get_diagram());
}

fn assert_all_repeated_elements_have_identity_keys(diagram: &erm::dtos::diagram::Diagram) {
    let tables = diagram
        .diagram_walkers
        .as_ref()
        .and_then(|walkers| walkers.tables.as_ref())
        .expect("fixture should contain tables");
    assert!(tables.iter().all(|table| table.identity_key.is_some()));
    assert!(tables.iter().all(|table| {
        table.columns.items.iter().flatten().all(|item| match item {
            erm::dtos::diagram::diagram_walkers::tables::columns::ColumnItem::Normal(column) => {
                column.identity_key.is_some()
            }
            erm::dtos::diagram::diagram_walkers::tables::columns::ColumnItem::Group(_) => true,
        })
    }));
    assert!(tables.iter().all(|table| {
        table
            .connections
            .relationships
            .iter()
            .flatten()
            .all(|relationship| relationship.identity_key.is_some())
            && table
                .indexes
                .iter()
                .flatten()
                .all(|index| index.identity_key.is_some())
            && table
                .compound_unique_key_list
                .compound_unique_keys
                .iter()
                .flatten()
                .all(|key| key.identity_key.is_some())
    }));

    assert!(diagram.vdiagrams.iter().flatten().all(|vdiagram| {
        vdiagram.identity_key.is_some()
            && vdiagram
                .vtables
                .iter()
                .flatten()
                .all(|vtable| vtable.identity_key.is_some())
    }));
    assert!(diagram.column_groups.iter().flatten().all(|group| {
        group.identity_key.is_some()
            && group
                .columns
                .normal_columns
                .iter()
                .flatten()
                .all(|column| column.identity_key.is_some())
    }));
}
