use super::entities::diagram::Diagram;
use super::errors::Error;
use quick_xml::se::to_string_with_root;
use std::fs;

const XML_DECLARATION: &str = r#"<?xml version="1.0" encoding="UTF-8"?>"#;

pub fn write_file(filename: &str, diagram: Diagram) -> Result<(), Error> {
    let xml = to_string_with_root("diagram", &diagram)?;
    fs::write(filename, format!("{XML_DECLARATION}\n{xml}\n"))?;
    Ok(())
}
