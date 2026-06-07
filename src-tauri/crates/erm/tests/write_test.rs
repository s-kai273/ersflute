use std::fs;

use erm::dtos::diagram;
use erm::dtos::diagram::diagram_settings;
use erm::{open, save};
use pretty_assertions::assert_eq;

#[test]
fn writes_a_diagram_that_can_be_opened_again() {
    let diagram = open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse");
    let path = temp_file_path("round_trip");

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let reopened = open(path.to_str().expect("invalid temp path")).expect("failed to reopen");

    fs::remove_file(&path).expect("failed to remove temp file");
    assert_eq!(
        reopened,
        open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse")
    );
}

#[test]
fn writes_optional_diagram_sections_without_forcing_empty_collections() {
    let diagram = diagram::Diagram {
        presenter: None,
        page_settings: None,
        category_index: None,
        current_ermodel: None,
        zoom: None,
        x: None,
        y: None,
        default_color: None,
        color: None,
        font_name: None,
        font_size: None,
        diagram_settings: diagram_settings::DiagramSettings {
            database: "MySQL".to_string(),
            capital: true,
            table_style: "".to_string(),
            notation: "".to_string(),
            notation_level: 0,
            notation_expand_group: true,
            view_mode: 1,
            outline_view_mode: 1,
            view_order_by: 1,
            auto_ime_change: false,
            validate_physical_name: true,
            use_bezier_curve: false,
            suspend_validator: false,
            title_font_em: None,
            master_data_base_path: None,
            use_view_object: false,
            export_settings: diagram_settings::ExportSettings {},
            category_settings: diagram_settings::CategorySettings {},
            model_properties: diagram_settings::ModelProperties {},
            table_properties: diagram_settings::TableProperties {},
            environment_settings: None,
            design_settings: None,
        },
        diagram_walkers: None,
        vdiagrams: None,
        column_groups: None,
    };
    let path = temp_file_path("optional_sections");

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let content = fs::read_to_string(&path).expect("failed to read written file");
    fs::remove_file(&path).expect("failed to remove temp file");

    assert!(!content.contains("<diagram_walkers>"));
    assert!(!content.contains("<vdiagrams>"));
    assert!(!content.contains("<column_groups>"));
}

fn temp_file_path(test_name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_write_{}_{}.erm",
        std::process::id(),
        test_name
    ))
}
