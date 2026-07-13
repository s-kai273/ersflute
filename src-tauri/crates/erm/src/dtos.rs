pub mod diagram;
mod identified;

pub use identified::Identified;
pub(crate) use identified::{identified_from_entity, identified_into_entity};
