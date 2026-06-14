use erm::dtos::diagram::diagram_settings;

use crate::write::support;

#[test]
fn diagram_settings_tags_are_serialized() {
    let mut diagram = support::minimal_diagram();
    diagram.diagram_settings = diagram_settings::DiagramSettings {
        database: "MySQL".to_string(),
        capital: true,
        table_style: "standard".to_string(),
        notation: "IE".to_string(),
        notation_level: 1,
        notation_expand_group: false,
        view_mode: 1,
        outline_view_mode: 2,
        view_order_by: 3,
        auto_ime_change: false,
        validate_physical_name: true,
        use_bezier_curve: false,
        suspend_validator: false,
        title_font_em: Some(1.5),
        master_data_base_path: Some("master.db".to_string()),
        use_view_object: true,
        export_settings: diagram_settings::ExportSettings {},
        category_settings: diagram_settings::CategorySettings {},
        model_properties: diagram_settings::ModelProperties {},
        table_properties: diagram_settings::TableProperties {},
        environment_settings: Some(diagram_settings::EnvironmentSettings {}),
        design_settings: Some(diagram_settings::DesignSettings {}),
    };

    support::assert_serialized_element(
        diagram,
        "diagram_settings",
        "diagram_settings",
        include_str!("../../fixtures/diagram/diagram_settings.erm"),
    );
}
