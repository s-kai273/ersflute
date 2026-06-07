use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    Parse(#[from] quick_xml::de::DeError),

    #[error("Serialize error: {0}")]
    Serialize(#[from] quick_xml::se::SeError),

    #[error("{0}")]
    Validation(#[from] crate::validation::ValidationError),
}
