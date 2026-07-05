use crate::write::support;

#[test]
fn saved_xml_uses_tab_indentation() {
    let content = support::save_diagram_to_string(support::minimal_diagram(), "xml_format");

    assert!(content.starts_with(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<diagram>\n\t<diagram_settings>\n\t\t<database>MySQL</database>"
    ));
    assert!(content.contains("\n\t\t<view_mode>1</view_mode>\n\t</diagram_settings>"));
    assert!(content.ends_with("\n</diagram>\n"));
}
