pub mod entities;
mod reader;

use entities::Diagram;
use reader::read_file;

pub fn open(filename: &str) -> Result<Diagram, Box<dyn std::error::Error>> {
    let diagram: Diagram = read_file(&filename)?;
    Ok(diagram)
}
