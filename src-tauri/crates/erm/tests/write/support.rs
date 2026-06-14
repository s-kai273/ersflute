use std::fs;

use pretty_assertions::assert_eq;

use erm::dtos::diagram;
use erm::dtos::diagram::Diagram;
use erm::dtos::diagram::diagram_settings;
use erm::save;

pub(crate) fn save_diagram_to_string(diagram: Diagram, test_name: &str) -> String {
    let path = temp_file_path(test_name);

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let content = fs::read_to_string(&path).expect("failed to read written file");
    fs::remove_file(&path).expect("failed to remove temp file");

    content
}

pub(crate) fn assert_serialized_element(
    diagram: Diagram,
    test_name: &str,
    tag_name: &str,
    expected: &str,
) {
    let content = save_diagram_to_string(diagram, test_name);

    assert_eq!(
        extract_element(&content, tag_name),
        extract_element(expected, tag_name)
    );
}

pub(crate) fn extract_element(content: &str, tag_name: &str) -> String {
    let start = content
        .find(&format!("<{tag_name}>"))
        .or_else(|| content.find(&format!("<{tag_name}/>")))
        .expect("failed to find element start");

    if content[start..].starts_with(&format!("<{tag_name}/>")) {
        return format!("<{tag_name}/>");
    }

    let end_tag = format!("</{tag_name}>");
    let end = content[start..]
        .find(&end_tag)
        .map(|index| start + index + end_tag.len())
        .expect("failed to find element end");

    content[start..end].to_string()
}

pub(crate) fn minimal_diagram() -> diagram::Diagram {
    diagram::Diagram {
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
        diagram_settings: minimal_diagram_settings(),
        diagram_walkers: None,
        vdiagrams: None,
        column_groups: None,
    }
}

pub(crate) fn minimal_diagram_settings() -> diagram_settings::DiagramSettings {
    diagram_settings::DiagramSettings {
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
    }
}

fn temp_file_path(test_name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_write_{}_{}.erm",
        std::process::id(),
        test_name
    ))
}
