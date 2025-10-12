mod erm;
pub use erm::{Diagram, DiagramSettings, read_file};

pub fn open(filename: &str) -> Result<Diagram, Box<dyn std::error::Error>> {
    match read_file(&filename) {
        Err(e) => {
            eprintln!("Error occurred while reading erm file: {}", e);
            std::process::exit(1);
        }
        Ok(file) => Ok(file),
    }
}
