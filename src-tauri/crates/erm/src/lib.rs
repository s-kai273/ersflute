pub mod column_type;
pub mod dtos;
pub mod entities;
pub mod errors;
mod reader;
mod validation;
mod writer;

use dtos::diagram::Diagram;
use errors::Error;
use reader::read_file;
use writer::write_file;

pub fn open(filename: &str) -> Result<Diagram, Error> {
    let (entity, content) = read_file(filename)?;
    let mut diagram = Diagram::from(entity);
    diagram.preserved_xml = Some(content);
    validation::validate(&diagram)?;
    Ok(diagram)
}

pub fn save(filename: &str, diagram: Diagram) -> Result<(), Error> {
    validation::validate(&diagram)?;
    write_file(filename, diagram)
}
