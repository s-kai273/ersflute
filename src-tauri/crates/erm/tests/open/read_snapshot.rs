use pretty_assertions::assert_eq;

#[path = "../support/snapshot_diagram.rs"]
mod snapshot_diagram;

use erm::open;

#[test]
fn test_read_snapshot() {
    let diagram = open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse");
    assert_eq!(diagram, snapshot_diagram::get_diagram());
}
