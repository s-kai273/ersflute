use pretty_assertions::assert_eq;

use erm::dtos::diagram;
use erm::dtos::diagram::diagram_settings;

use crate::write::support;

#[test]
fn diagram_tags_are_serialized() {
    let diagram = diagram::Diagram {
        presenter: Some("ERFlute".to_string()),
        page_settings: None,
        category_index: Some(2),
        current_ermodel: Some("main".to_string()),
        zoom: Some(1.25),
        x: Some(-10),
        y: Some(20),
        default_color: Some(diagram::Color { r: 1, g: 2, b: 3 }),
        color: Some(diagram::Color { r: 4, g: 5, b: 6 }),
        font_name: Some("Ubuntu".to_string()),
        font_size: Some(9),
        diagram_settings: diagram_settings(),
        diagram_walkers: None,
        vdiagrams: None,
        column_groups: None,
    };

    let content = support::save_diagram_to_string(diagram, "diagram_tags");
    let expected = include_str!("../../fixtures/diagram/diagram.erm");

    assert_eq!(
        remove_diagram_settings(&content),
        remove_diagram_settings(expected)
    );
}

fn remove_diagram_settings(content: &str) -> String {
    let start = content
        .find("<diagram_settings>")
        .expect("failed to find diagram_settings start");
    let end = content
        .find("</diagram_settings>")
        .map(|index| index + "</diagram_settings>".len())
        .expect("failed to find diagram_settings end");

    let mut content = content.to_string();
    content.replace_range(start..end, "");
    content
}

fn diagram_settings() -> diagram_settings::DiagramSettings {
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
