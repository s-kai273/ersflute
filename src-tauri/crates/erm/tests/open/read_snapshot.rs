use pretty_assertions::assert_eq;

#[path = "../support/snapshot_diagram.rs"]
mod snapshot_diagram;

use erm::open;

use crate::open::support;

#[test]
fn test_read_snapshot() {
    let mut diagram = open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse");
    assert!(
        diagram
            .diagram_walkers
            .as_ref()
            .and_then(|diagram_walkers| diagram_walkers.tables.as_ref())
            .is_some_and(|tables| tables.iter().all(|table| table.identity_key.is_some()))
    );
    support::clear_identity_keys(&mut diagram);
    assert_eq!(diagram, snapshot_diagram::get_diagram());
}
