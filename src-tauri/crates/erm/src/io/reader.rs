use super::xml_preservation::collect_xml_node_identities;
use crate::dtos::diagram::Diagram;
use crate::errors::Error;
use quick_xml::de::from_str;
use std::fs;

pub fn read_file(filename: &str) -> Result<Diagram, Error> {
    let content = fs::read_to_string(filename)?;
    let entity: crate::entities::diagram::Diagram = from_str(&content)?;
    let mut diagram = Diagram::from(entity);

    // Saving is merge-based, so keep the original XML and stable identities for
    // repeated nodes before DTO edits can change names or ordering.
    diagram.xml_node_ids = collect_xml_node_identities(&content)?;
    diagram.preserved_xml = Some(content);
    Ok(diagram)
}
