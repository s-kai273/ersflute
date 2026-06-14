use pretty_assertions::assert_eq;

use erm::dtos::diagram;

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
        diagram_settings: support::minimal_diagram_settings(),
        diagram_walkers: None,
        vdiagrams: None,
        column_groups: None,
    };

    let content = support::save_diagram_to_string(diagram, "diagram_tags");
    let expected = include_str!("../../fixtures/diagram/diagram.erm");

    assert_eq!(
        remove_element(&content, "diagram_settings"),
        remove_element(expected, "diagram_settings")
    );
}

fn remove_element(content: &str, tag_name: &str) -> String {
    let element = support::extract_element(content, tag_name);
    let start = content
        .find(&element)
        .expect("failed to find element for removal");

    let mut content = content.to_string();
    content.replace_range(start..start + element.len(), "");
    content
}
