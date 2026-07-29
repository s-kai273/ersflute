use crate::write::support as write_support;

use super::support;

#[test]
fn diagram_walkers_details_are_serialized() {
    let content =
        write_support::save_diagram_to_string(support::diagram(), "diagram_walkers_details");

    assert_eq!(
        write_support::compact_xml(&write_support::extract_element(&content, "diagram_walkers")),
        write_support::compact_xml(&write_support::extract_element(
            support::DETAILS_FIXTURE,
            "diagram_walkers",
        ))
    );
}

#[test]
fn managed_leaf_newlines_are_serialized_as_carriage_return_references() {
    let mut diagram = support::diagram();
    let description = "Line 1 & value\nLine 2 < value\r\nLine 3\rLine 4";
    let table = diagram
        .diagram_walkers
        .as_mut()
        .and_then(|walkers| walkers.tables.as_mut())
        .and_then(|tables| tables.first_mut())
        .expect("missing table fixture");
    table.logical_name = "Members\nMaster".to_string();
    table.description = description.to_string();

    let (content, reopened) =
        write_support::save_and_reopen_diagram(diagram, "description_newlines");

    assert!(content.contains(
        "<description>Line 1 &amp; value&#x0D;Line 2 &lt; value&#x0D;Line 3&#x0D;Line 4</description>"
    ));
    assert!(content.contains("<logical_name>Members&#x0D;Master</logical_name>"));
    let reopened_table = reopened
        .diagram_walkers
        .and_then(|walkers| walkers.tables)
        .and_then(|tables| tables.into_iter().next())
        .expect("missing reopened table");
    assert_eq!(reopened_table.logical_name, "Members\rMaster");
    assert_eq!(
        reopened_table.description,
        "Line 1 & value\rLine 2 < value\rLine 3\rLine 4"
    );
}
