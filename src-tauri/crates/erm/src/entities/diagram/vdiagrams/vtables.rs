use crate::entities::XmlSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct Vtable {
    pub table_id: String,
    pub x: u16,
    pub y: u16,
    pub font_name: String,
    pub font_size: u16,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct Vtables {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "vtable")]
    pub vtables: Option<Vec<Vtable>>,
}
