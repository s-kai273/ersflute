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

#[test]
fn empty_managed_string_values_remain_inline_and_reopen_as_empty() {
    let mut diagram = support::minimal_diagram();
    diagram.diagram_settings.database = String::new();

    let (content, reopened) = support::save_and_reopen_diagram(diagram, "empty_managed_string");

    assert!(content.contains("<database></database>"));
    assert_eq!(reopened.diagram_settings.database, "");
}

#[test]
fn empty_unknown_elements_remain_inline() {
    let mut diagram = support::minimal_diagram();
    diagram.preserved_xml = Some(
        "<diagram><diagram_settings><database>MySQL</database><extension></extension><view_mode>1</view_mode></diagram_settings></diagram>"
            .to_string(),
    );
    diagram.diagram_settings.view_mode = 2;

    let content = support::save_diagram_to_string(diagram, "empty_unknown_element");

    assert!(content.contains("<extension></extension>"));
}

#[test]
fn whitespace_only_managed_string_values_are_preserved() {
    let whitespace = " \t ";
    let mut diagram = support::minimal_diagram();
    diagram.diagram_settings.database = whitespace.to_string();

    let (content, reopened) =
        support::save_and_reopen_diagram(diagram, "whitespace_managed_string");

    assert!(content.contains(&format!("<database>{whitespace}</database>")));
    assert_eq!(reopened.diagram_settings.database, whitespace);
}

#[test]
fn line_feed_only_managed_string_values_use_a_line_feed_reference() {
    let mut diagram = support::minimal_diagram();
    diagram.diagram_settings.database = "\n".to_string();

    let (content, reopened) =
        support::save_and_reopen_diagram(diagram, "newline_only_managed_string");

    assert!(content.contains("<database>&#x0A;</database>"));
    assert_eq!(reopened.diagram_settings.database, "\n");
}
