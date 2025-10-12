use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Table {
    pub physical_name: String,
    pub logical_name: String,
    pub description: String,
    pub height: u16,
    pub width: u16,
    pub font_name: String,
    pub font_size: u16,
    pub x: u16,
    pub y: u16,
    pub color: Color,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DiagramWalkers {
    pub table: Vec<Table>,
}
