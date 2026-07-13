pub mod column_type;
pub mod dtos;
pub mod entities;
pub mod errors;
mod identity;
mod io;
mod validation;

use dtos::diagram::Diagram;
use errors::Error;
use io::{read_file, write_file};

pub fn open(filename: &str) -> Result<Diagram, Error> {
    let diagram = read_file(filename)?;
    validation::validate(&diagram)?;
    Ok(diagram)
}

pub fn save(filename: &str, diagram: Diagram) -> Result<(), Error> {
    validation::validate(&diagram)?;
    write_file(filename, diagram)
}
