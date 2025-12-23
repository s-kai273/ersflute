pub mod dtos;
pub mod entities;
mod reader;

use dtos::diagram::Diagram;
use reader::read_file;

pub fn open(filename: &str) -> Result<Diagram, Box<dyn std::error::Error>> {
    let diagram = read_file(&filename)?;
    Ok(diagram.into())
}
