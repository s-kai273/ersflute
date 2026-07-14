use pretty_assertions::assert_eq;

use erm::errors::Error;
use erm::save;
use quick_xml::errors::IllFormedError;

use crate::write::support;

#[test]
fn saving_without_preserved_xml_is_rejected() {
    let mut diagram = support::minimal_diagram();
    diagram.preserved_xml = None;
    let path = temp_file_path();

    let error = save(path.to_str().expect("invalid temp path"), diagram)
        .expect_err("saving without preserved XML should fail");

    assert_eq!(
        error.to_string(),
        "preserved XML is required to save a diagram"
    );
}

#[test]
fn saving_with_truncated_preserved_xml_returns_an_error() {
    let mut diagram = support::minimal_diagram();
    diagram.preserved_xml = Some("<diagram><diagram_settings>".to_string());
    let path = temp_file_path();

    let error = save(path.to_str().expect("invalid temp path"), diagram)
        .expect_err("saving with truncated preserved XML should fail");

    assert!(matches!(
        error,
        Error::Xml(quick_xml::Error::IllFormed(
            IllFormedError::MissingEndTag(tag)
        )) if tag == "diagram_settings"
    ));
}

fn temp_file_path() -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_write_{}_preserved_xml.erm",
        std::process::id()
    ))
}
