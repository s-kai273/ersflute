use super::entities::diagram::Diagram;
use super::errors::Error;
use quick_xml::de::from_str;
use std::fs;

pub fn read_file(filename: &str) -> Result<(Diagram, String), Error> {
    let content = fs::read_to_string(filename)?;
    let value: Diagram = from_str(&content)?;
    Ok((value, content))
}
