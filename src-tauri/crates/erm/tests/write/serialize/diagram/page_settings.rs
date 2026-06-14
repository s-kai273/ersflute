use erm::dtos::diagram::page_settings;

use crate::write::support;

#[test]
fn page_settings_tags_are_serialized() {
    let mut diagram = support::minimal_diagram();
    diagram.page_settings = Some(page_settings::PageSettings {
        direction_horizontal: true,
        scale: 100,
        paper_size: "A4 210 x 297 mm".to_string(),
        top_margin: 30,
        left_margin: 31,
        bottom_margin: 32,
        right_margin: 33,
    });

    support::assert_serialized_element(
        diagram,
        "page_settings",
        "page_settings",
        include_str!("../../fixtures/diagram/page_settings.erm"),
    );
}
