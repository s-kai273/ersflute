use crate::entities::XmlSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct DiagramSettings {
    pub database: String,
    pub view_mode: i64,
}
