use pretty_assertions::assert_eq;

use crate::write::support;

#[test]
fn used_settings_are_updated_and_other_settings_are_preserved() {
    let mut diagram = support::minimal_diagram();
    diagram.preserved_xml = Some(
        include_str!("../../../open/fixtures/diagram/diagram_settings.erm").replace(
            "  </diagram_settings>",
            "    <unknown_setting><nested_value>preserved</nested_value></unknown_setting>\n  </diagram_settings>",
        ),
    );
    diagram.diagram_settings.database = "PostgreSQL".to_string();
    diagram.diagram_settings.view_mode = 2;

    let content = support::save_diagram_to_string(diagram, "diagram_settings");
    let settings = support::extract_element(&content, "diagram_settings");

    assert!(settings.contains("<database>PostgreSQL</database>"));
    assert!(settings.contains("<view_mode>2</view_mode>"));
    assert!(settings.contains("<capital>true</capital>"));
    assert!(settings.contains("<unknown_setting>"));
    assert!(settings.contains("<nested_value>preserved</nested_value>"));
}

#[test]
fn missing_used_settings_are_added_without_removing_existing_settings() {
    let mut diagram = support::minimal_diagram();
    diagram.preserved_xml = Some(
        "<diagram><diagram_settings><capital>true</capital></diagram_settings></diagram>"
            .to_string(),
    );

    let content = support::save_diagram_to_string(diagram, "missing_diagram_settings");

    assert_eq!(
        support::compact_xml(&support::extract_element(&content, "diagram_settings")),
        "<diagram_settings><capital>true</capital><database>MySQL</database><view_mode>1</view_mode></diagram_settings>"
    );
}
