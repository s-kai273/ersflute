use super::xml_preservation::diagram_from_entity_with_preserved_xml;
use crate::dtos::diagram::Diagram;
use crate::errors::Error;
use quick_xml::de::from_str;
use std::fs;

pub fn read_file(filename: &str) -> Result<Diagram, Error> {
    let content = fs::read_to_string(filename)?;
    let entity: crate::entities::diagram::Diagram = from_str(&content)?;

    // Saving is merge-based, so keep the original XML and attach stable keys to
    // repeated DTO elements before edits can change their ordering.
    diagram_from_entity_with_preserved_xml(entity, content)
}
