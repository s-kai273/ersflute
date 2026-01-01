use super::entities::diagram::Diagram;
use quick_xml::de::from_reader;
use std::fs::File;
use std::io::BufReader;

pub fn read_file(filename: &str) -> Result<Diagram, Box<dyn std::error::Error>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    let value: Diagram = from_reader(reader)?;
    Ok(value)
}
