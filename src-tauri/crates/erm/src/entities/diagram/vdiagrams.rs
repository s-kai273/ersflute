pub mod vtables;

use crate::entities::XmlSchema;
use serde::{Deserialize, Serialize};
use vtables::VTables;

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct WalkerNotes {}

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct WalkerGroups {}

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
#[xml_schema(tag = "vdiagram")]
pub struct VDiagram {
    pub vdiagram_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,

    pub vtables: VTables,
    pub walker_notes: WalkerNotes,
    pub walker_groups: WalkerGroups,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
#[xml_schema(tag = "vdiagrams")]
pub struct VDiagrams {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "vdiagram")]
    pub vdiagrams: Option<Vec<VDiagram>>,
}
