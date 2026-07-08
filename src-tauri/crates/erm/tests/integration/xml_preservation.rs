use std::fs;

use pretty_assertions::assert_eq;

use erm::dtos::diagram::Diagram;
use erm::{open, save};

#[test]
fn repeated_tables_keep_their_preserved_content_after_rename() {
    let source = diagram_with_tables(&[
        table_with_extra("FIRST", "<before>first</before>", ""),
        table_with_extra("SECOND", "<before>second</before>", ""),
    ]);

    let saved = open_edit_save(&source, "repeated_elements", |diagram| {
        let tables = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .expect("missing tables");

        tables[0].physical_name = "RENAMED_FIRST".to_string();
        tables[0].logical_name = "RENAMED_FIRST".to_string();
        tables[1].physical_name = "RENAMED_SECOND".to_string();
        tables[1].logical_name = "RENAMED_SECOND".to_string();
    });

    assert_eq!(
        compact_xml(&extract_diagram_walkers(&saved)),
        format!(
            concat!(
                "<diagram_walkers>",
                "<table><before>first</before>",
                "<physical_name>RENAMED_FIRST</physical_name>",
                "{}",
                "</table>",
                "<table><before>second</before>",
                "<physical_name>RENAMED_SECOND</physical_name>",
                "{}",
                "</table>",
                "</diagram_walkers>",
            ),
            table_after_physical_name("RENAMED_FIRST"),
            table_after_physical_name("RENAMED_SECOND"),
        )
    );
}

#[test]
fn reordered_repeated_tables_are_saved_in_managed_order() {
    let source = diagram_with_tables(&[
        table_with_extra("FIRST", "<before>first</before>", ""),
        table_with_extra("SECOND", "<before>second</before>", ""),
    ]);

    let saved = open_edit_save(&source, "reordered_repeated_elements", |diagram| {
        let tables = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .expect("missing tables");

        tables.swap(0, 1);
    });

    assert_eq!(
        compact_xml(&extract_diagram_walkers(&saved)),
        format!(
            concat!(
                "<diagram_walkers>",
                "<table><before>second</before>",
                "<physical_name>SECOND</physical_name>",
                "{}",
                "</table>",
                "<table><before>first</before>",
                "<physical_name>FIRST</physical_name>",
                "{}",
                "</table>",
                "</diagram_walkers>",
            ),
            table_after_physical_name("SECOND"),
            table_after_physical_name("FIRST"),
        )
    );
}

#[test]
fn unknown_nested_elements_attributes_and_comments_keep_their_positions() {
    let source = diagram_with_tables(&[table_with_extra(
        "OLD",
        "",
        "<!-- marker --><extension enabled=\"true\"><nested>value</nested></extension>",
    )
    .replace("<table>", "<table custom=\"kept\">")]);

    let saved = open_edit_save(&source, "unknown_nested_elements", |diagram| {
        let table = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .expect("missing table");

        table.physical_name = "NEW".to_string();
        table.logical_name = "New label".to_string();
    });

    assert_eq!(
        compact_xml(&extract_diagram_walkers(&saved)),
        format!(
            concat!(
                "<diagram_walkers>",
                "<table custom=\"kept\">",
                "<physical_name>NEW</physical_name>",
                "<!-- marker --><extension enabled=\"true\"><nested>value</nested></extension>",
                "<logical_name>New label</logical_name>",
                "{}",
                "</table>",
                "</diagram_walkers>",
            ),
            TABLE_AFTER_LOGICAL_NAME,
        )
    );
}

#[test]
fn empty_elements_can_be_updated_with_text() {
    let source = diagram_with_settings("<database/><view_mode>1</view_mode>");

    let saved = open_edit_save(&source, "empty_element", |diagram| {
        diagram.diagram_settings.database = "PostgreSQL".to_string();
    });

    assert_eq!(
        compact_xml(&extract_diagram_settings(&saved)),
        "<diagram_settings><database>PostgreSQL</database><view_mode>1</view_mode></diagram_settings>"
    );
}

#[test]
fn entity_defined_children_are_matched_instead_of_duplicated() {
    let source = diagram_with_tables(&[table("OLD")
        .replace(
            "<physical_name>OLD</physical_name>",
            "<table_properties/><physical_name>OLD</physical_name>",
        )
        .replace(
            "<compound_unique_key_list/><table_properties/>",
            "<compound_unique_key_list/>",
        )]);

    let saved = open_edit_save(&source, "known_children", |diagram| {
        let table = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .expect("missing table");

        table.physical_name = "NEW".to_string();
        table.logical_name = "NEW".to_string();
    });

    assert_eq!(
        compact_xml(&extract_diagram_walkers(&saved)),
        format!(
            concat!(
                "<diagram_walkers>",
                "<table>",
                "<table_properties/>",
                "<physical_name>NEW</physical_name>",
                "{}",
                "</table>",
                "</diagram_walkers>",
            ),
            table_after_physical_name_without_table_properties("NEW"),
        )
    );
}

fn open_edit_save(source: &str, test_name: &str, edit: impl FnOnce(&mut Diagram)) -> String {
    let source_path = temp_file_path(test_name, "source");
    let output_path = temp_file_path(test_name, "output");

    fs::write(&source_path, source).expect("failed to write source XML");

    let mut diagram =
        open(source_path.to_str().expect("invalid source path")).expect("failed to open XML");
    edit(&mut diagram);
    save(output_path.to_str().expect("invalid output path"), diagram).expect("failed to save XML");

    let output = fs::read_to_string(&output_path).expect("failed to read output XML");
    fs::remove_file(source_path).expect("failed to remove source XML");
    fs::remove_file(output_path).expect("failed to remove output XML");

    output
        .strip_prefix("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        .expect("missing XML declaration")
        .strip_suffix('\n')
        .expect("missing trailing newline")
        .to_string()
}

fn diagram_with_settings(settings: &str) -> String {
    format!("<diagram><diagram_settings>{settings}</diagram_settings></diagram>")
}

fn diagram_with_tables(tables: &[String]) -> String {
    format!(
        "{}<diagram_walkers>{}</diagram_walkers></diagram>",
        diagram_with_settings("<database>MySQL</database><view_mode>1</view_mode>")
            .trim_end_matches("</diagram>"),
        tables.join(""),
    )
}

fn table(physical_name: &str) -> String {
    table_with_extra(physical_name, "", "")
}

fn table_with_extra(
    physical_name: &str,
    before_logical_name: &str,
    after_physical_name: &str,
) -> String {
    format!(
        "<table>{before_logical_name}<physical_name>{physical_name}</physical_name>{after_physical_name}<logical_name>{physical_name}</logical_name>{SOURCE_TABLE_AFTER_LOGICAL_NAME}</table>"
    )
}

fn extract_diagram_settings(content: &str) -> String {
    extract_element(content, "diagram_settings")
}

fn extract_diagram_walkers(content: &str) -> String {
    extract_element(content, "diagram_walkers")
}

fn extract_element(content: &str, tag_name: &str) -> String {
    let start = content
        .find(&format!("<{tag_name}>"))
        .expect("failed to find element start");
    let end_tag = format!("</{tag_name}>");
    let end = content[start..]
        .find(&end_tag)
        .map(|index| start + index + end_tag.len())
        .expect("failed to find element end");

    content[start..end].to_string()
}

fn compact_xml(content: &str) -> String {
    content
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<String>()
}

fn temp_file_path(test_name: &str, role: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_xml_preservation_{}_{}_{}.erm",
        std::process::id(),
        test_name,
        role,
    ))
}

fn table_after_physical_name(logical_name: &str) -> String {
    format!("<logical_name>{logical_name}</logical_name>{TABLE_AFTER_LOGICAL_NAME}")
}

fn table_after_physical_name_without_table_properties(logical_name: &str) -> String {
    format!(
        "<logical_name>{logical_name}</logical_name>{TABLE_AFTER_LOGICAL_NAME_WITHOUT_TABLE_PROPERTIES}"
    )
}

const TABLE_AFTER_LOGICAL_NAME: &str = concat!(
    "<description></description>",
    "<font_name>Ubuntu</font_name>",
    "<font_size>9</font_size>",
    "<x>1</x>",
    "<y>2</y>",
    "<color><r>128</r><g>128</g><b>192</b></color>",
    "<connections/>",
    "<columns/>",
    "<indexes/>",
    "<compound_unique_key_list/>",
    "<table_properties/>",
);

const TABLE_AFTER_LOGICAL_NAME_WITHOUT_TABLE_PROPERTIES: &str = concat!(
    "<description></description>",
    "<font_name>Ubuntu</font_name>",
    "<font_size>9</font_size>",
    "<x>1</x>",
    "<y>2</y>",
    "<color><r>128</r><g>128</g><b>192</b></color>",
    "<connections/>",
    "<columns/>",
    "<indexes/>",
    "<compound_unique_key_list/>",
);

const SOURCE_TABLE_AFTER_LOGICAL_NAME: &str = concat!(
    "<description></description>",
    "<font_name>Ubuntu</font_name>",
    "<font_size>9</font_size>",
    "<x>1</x>",
    "<y>2</y>",
    "<color><r>128</r><g>128</g><b>192</b></color>",
    "<connections/>",
    "<columns/>",
    "<indexes/>",
    "<compound_unique_key_list/>",
    "<table_properties/>",
);
