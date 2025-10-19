use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FkColumn {
    pub fk_column_name: String,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Relationship {
    pub name: String,
    pub source: String,
    pub target: String,
    pub fk_columns: FkColumns,
    pub parent_cardinality: u8,
    pub child_cardinality: u8,
    pub reference_for_pk: bool,
    pub on_delete_action: String,
    pub on_update_action: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct Connections {
    #[serde(default)]
    pub relationship: Vec<Relationship>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default)]
    pub logical_name: String,

    #[serde(default)]
    #[serde(rename = "type")]
    pub column_type: String,

    #[serde(default)]
    pub length: u16,

    pub not_null: bool,

    #[serde(default)]
    pub primary_key: bool,

    #[serde(default)]
    pub referred_column: String,

    #[serde(default)]
    pub relationship: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    pub normal_column: Vec<NormalColumn>,
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

    #[serde(default)]
    pub connections: Connections,

    pub columns: Columns,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DiagramWalkers {
    pub table: Vec<Table>,
}
