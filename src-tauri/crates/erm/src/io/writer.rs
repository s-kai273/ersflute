use super::xml_preservation::merge_preserved_xml;
use crate::dtos::diagram::Diagram;
use crate::errors::Error;
use quick_xml::se::to_string_with_root;
use std::fs;

const XML_DECLARATION: &str = r#"<?xml version="1.0" encoding="UTF-8"?>"#;

pub fn write_file(filename: &str, diagram: Diagram) -> Result<(), Error> {
    // Writes require the original XML because serialization only owns the
    // managed ERM model; unknown nodes and raw XML events are restored by merge.
    let preserved_xml = diagram
        .preserved_xml
        .clone()
        .ok_or(Error::MissingPreservedXml)?;
    let identities = diagram.xml_node_ids.clone();
    let entity: crate::entities::diagram::Diagram = diagram.into();

    // Serialize the edited DTO as clean managed XML, then merge it into the
    // preserved source XML to keep comments, attributes, and unsupported nodes.
    let managed_xml = to_string_with_root("diagram", &entity)?;
    let xml = merge_preserved_xml(&preserved_xml, &managed_xml, &identities)?;

    fs::write(filename, format!("{XML_DECLARATION}\n{xml}\n"))?;
    Ok(())
}
