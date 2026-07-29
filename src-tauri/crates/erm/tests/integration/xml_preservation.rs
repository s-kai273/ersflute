use std::fs;

use pretty_assertions::assert_eq;

use erm::dtos::diagram::Diagram;
use erm::dtos::diagram::diagram_walkers::tables::columns::ColumnItem;
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
fn reordered_nested_normal_columns_keep_their_preserved_content() {
    let source = diagram_with_tables(&[table("TABLE").replace(
        "<columns/>",
        concat!(
            "<columns>",
            "<normal_column><before>first</before><physical_name>FIRST</physical_name></normal_column>",
            "<normal_column><before>second</before><physical_name>SECOND</physical_name></normal_column>",
            "<column_group>GROUP</column_group>",
            "</columns>",
        ),
    )])
    .replace(
        "</diagram>",
        "<column_groups><column_group><column_group_name>GROUP</column_group_name><columns/></column_group></column_groups></diagram>",
    );

    let saved = open_edit_save(&source, "reordered_nested_normal_columns", |diagram| {
        let items = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .and_then(|table| table.columns.items.as_mut())
            .expect("missing columns");

        assert!(matches!(items[0], ColumnItem::Normal(_)));
        assert!(matches!(items[1], ColumnItem::Normal(_)));
        assert!(matches!(items[2], ColumnItem::Group(_)));
        items.swap(0, 1);
    });

    assert_eq!(
        compact_xml(&extract_element(&saved, "columns")),
        concat!(
            "<columns>",
            "<normal_column><before>second</before><physical_name>SECOND</physical_name></normal_column>",
            "<normal_column><before>first</before><physical_name>FIRST</physical_name></normal_column>",
            "<column_group>GROUP</column_group>",
            "</columns>",
        )
    );
}

#[test]
fn reordered_mixed_columns_are_saved_in_managed_order() {
    let source = diagram_with_tables(&[table("TABLE").replace(
        "<columns/>",
        concat!(
            "<columns>",
            "<normal_column><before>first</before><physical_name>FIRST</physical_name></normal_column>",
            "<column_group>GROUP</column_group>",
            "<normal_column><before>second</before><physical_name>SECOND</physical_name></normal_column>",
            "</columns>",
        ),
    )])
    .replace(
        "</diagram>",
        "<column_groups><column_group><column_group_name>GROUP</column_group_name><columns/></column_group></column_groups></diagram>",
    );

    let saved = open_edit_save(&source, "reordered_mixed_columns", |diagram| {
        let items = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .and_then(|table| table.columns.items.as_mut())
            .expect("missing columns");

        assert!(matches!(items[0], ColumnItem::Normal(_)));
        assert!(matches!(items[1], ColumnItem::Group(_)));
        assert!(matches!(items[2], ColumnItem::Normal(_)));
        let group = items.remove(1);
        items.insert(0, group);
    });

    assert_eq!(
        compact_xml(&extract_element(&saved, "columns")),
        concat!(
            "<columns>",
            "<column_group>GROUP</column_group>",
            "<normal_column><before>first</before><physical_name>FIRST</physical_name></normal_column>",
            "<normal_column><before>second</before><physical_name>SECOND</physical_name></normal_column>",
            "</columns>",
        )
    );
}

#[test]
fn removing_a_bendpoint_rebuilds_the_non_identity_list() {
    let relationship = concat!(
        "<relationship>",
        "<name>RELATIONSHIP</name>",
        "<source>table.TABLE</source>",
        "<target>table.TABLE</target>",
        "<bendpoint><relative>true</relative><x>11</x><y>12</y>",
        "<unsupported>first</unsupported></bendpoint>",
        "<bendpoint><relative>false</relative><x>21</x><y>22</y>",
        "<unsupported>second</unsupported></bendpoint>",
        "<fk_columns/>",
        "<parent_cardinality>1</parent_cardinality>",
        "<child_cardinality>0..n</child_cardinality>",
        "<reference_for_pk>true</reference_for_pk>",
        "</relationship>",
    );
    let source = diagram_with_tables(&[table("TABLE")
        .replace(
            "<connections/>",
            &format!("<connections>{relationship}</connections>"),
        )
        .replace(
            "<columns/>",
            "<columns><normal_column><physical_name>ID</physical_name><primary_key>true</primary_key></normal_column></columns>",
        )]);

    let saved = open_edit_save(&source, "removed_bendpoint", |diagram| {
        let bendpoints = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .and_then(|table| table.connections.relationships.as_mut())
            .and_then(|relationships| relationships.first_mut())
            .and_then(|relationship| relationship.bendpoints.as_mut())
            .expect("missing bendpoints");

        bendpoints.remove(0);
    });

    let relationship = compact_xml(&extract_element(&saved, "relationship"));
    assert_eq!(relationship.matches("<bendpoint>").count(), 1);
    assert!(
        relationship
            .contains("<bendpoint><relative>false</relative><x>21</x><y>22</y></bendpoint>")
    );
    assert!(!relationship.contains("<unsupported>"));
}

#[test]
fn removing_an_optional_field_keeps_unknown_content_before_the_next_fixed_field() {
    let relationship = concat!(
        "<relationship>",
        "<name>RELATIONSHIP</name>",
        "<source>table.TABLE</source>",
        "<target>table.TABLE</target>",
        "<bendpoint><relative>true</relative><x>11</x><y>12</y></bendpoint>",
        "<fk_columns/>",
        "<parent_cardinality>1</parent_cardinality>",
        "<child_cardinality>0..n</child_cardinality>",
        "<reference_for_pk>true</reference_for_pk>",
        "<on_delete_action>CASCADE</on_delete_action>",
        "<extension>preserved</extension>",
        "<on_update_action>RESTRICT</on_update_action>",
        "</relationship>",
    );
    let source = diagram_with_tables(&[table("TABLE")
        .replace(
            "<connections/>",
            &format!("<connections>{relationship}</connections>"),
        )
        .replace(
            "<columns/>",
            "<columns><normal_column><physical_name>ID</physical_name><primary_key>true</primary_key></normal_column></columns>",
        )]);

    let saved = open_edit_save(&source, "removed_optional_field", |diagram| {
        let relationship = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .and_then(|table| table.connections.relationships.as_mut())
            .and_then(|relationships| relationships.first_mut())
            .expect("missing relationship");

        relationship.on_delete_action = None;
    });

    let relationship = compact_xml(&extract_element(&saved, "relationship"));
    assert!(!relationship.contains("<on_delete_action>"));
    assert!(relationship.contains(concat!(
        "<reference_for_pk>true</reference_for_pk>",
        "<extension>preserved</extension>",
        "<on_update_action>RESTRICT</on_update_action>",
    )));
}

#[test]
fn unknown_nested_elements_and_attributes_keep_their_positions() {
    let source = diagram_with_tables(&[table_with_extra(
        "OLD",
        "",
        "<extension enabled=\"true\"><nested>value</nested></extension>",
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
                "<extension enabled=\"true\"><nested>value</nested></extension>",
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
fn comments_are_removed_when_saved() {
    let source = diagram_with_tables(&[table_with_extra(
        "OLD",
        "<!-- before logical name -->",
        "<extension><!-- inside extension --><nested>value</nested></extension>",
    )]);

    let saved = open_edit_save(&source, "comments", |_| {});

    assert!(!saved.contains("<!--"));
    assert!(saved.contains("<extension>"));
    assert!(saved.contains("<nested>value</nested>"));
}

#[test]
fn whitespace_only_content_in_unknown_elements_is_preserved() {
    let source = diagram_with_tables(&[table_with_extra("OLD", "", "<extension> </extension>")]);

    let saved = open_edit_save(&source, "unknown_element_whitespace", |diagram| {
        let table = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .expect("missing table");

        table.physical_name = "NEW".to_string();
        table.logical_name = "NEW".to_string();
    });

    assert!(saved.contains("<extension> </extension>"));
}

#[test]
fn newlines_in_unknown_elements_are_preserved() {
    let source = diagram_with_tables(&[table_with_extra(
        "OLD",
        "",
        "<extension>first\nsecond</extension>",
    )]);

    let saved = open_edit_save(&source, "unknown_element_newline", |diagram| {
        let table = diagram
            .diagram_walkers
            .as_mut()
            .and_then(|walkers| walkers.tables.as_mut())
            .and_then(|tables| tables.first_mut())
            .expect("missing table");

        table.physical_name = "NEW".to_string();
    });

    assert!(saved.contains("<extension>first\nsecond</extension>"));
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

#[test]
fn unsupported_tags_are_classified_using_the_concrete_parent_type() {
    let source = diagram_with_tables(&[table("TABLE")
        .replace(
            "<columns/>",
            "<columns><normal_column><physical_name>ID</physical_name><primary_key>true</primary_key></normal_column></columns>",
        )
        .replace(
            "<indexes/>",
            concat!(
                "<indexes><index>",
                "<name>IDX_TABLE_ID</name><type>BTREE</type>",
                "<columns>",
                "<column><column_id>ID</column_id></column>",
                "<normal_column><unsupported>preserved</unsupported></normal_column>",
                "</columns>",
                "</index></indexes>",
            ),
        )]);

    let saved = open_edit_save(&source, "concrete_schema_context", |_| {});

    assert_eq!(
        compact_xml(&extract_element(&saved, "indexes")),
        concat!(
            "<indexes><index>",
            "<name>IDX_TABLE_ID</name><type>BTREE</type>",
            "<columns>",
            "<column><column_id>ID</column_id></column>",
            "<normal_column><unsupported>preserved</unsupported></normal_column>",
            "</columns>",
            "</index></indexes>",
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
