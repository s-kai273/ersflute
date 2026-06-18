use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("preserved XML is required to save a diagram")]
    MissingPreservedXml,

    #[error("Io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    Parse(#[from] quick_xml::de::DeError),

    #[error("Serialize error: {0}")]
    Serialize(#[from] quick_xml::se::SeError),

    #[error("Xml error: {0}")]
    Xml(#[from] quick_xml::Error),

    #[error("{0}")]
    Validation(#[from] crate::validation::ValidationError),
}
