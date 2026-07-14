use std::fs;

use pretty_assertions::assert_eq;

use erm::save;

use crate::write::support;

#[test]
fn writes_diagram_xml_as_snapshot() {
    let diagram = support::minimal_diagram();
    let path = temp_file_path();

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let content = fs::read_to_string(&path).expect("failed to read written file");
    fs::remove_file(&path).expect("failed to remove temp file");

    assert_eq!(content, EXPECTED_DIAGRAM_XML);
}

const EXPECTED_DIAGRAM_XML: &str = include_str!("./fixtures/write_snapshot.erm");

fn temp_file_path() -> std::path::PathBuf {
    std::env::temp_dir().join(format!("erm_write_{}_snapshot.erm", std::process::id()))
}
