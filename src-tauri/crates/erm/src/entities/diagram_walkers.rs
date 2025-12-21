use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct FkColumn {
    pub fk_column_name: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Relationship {
    pub name: String,
    pub source: String,
    pub target: String,
    pub fk_columns: FkColumns,
    pub parent_cardinality: String,
    pub child_cardinality: String,
    pub reference_for_pk: bool,
    pub on_delete_action: String,
    pub on_update_action: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Connections {
    #[serde(default)]
    #[serde(rename(serialize = "relationships", deserialize = "relationship"))]
    pub relationship: Vec<Relationship>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default)]
    pub logical_name: String,

    #[serde(default)]
    pub description: String,

    #[serde(default)]
    #[serde(rename(serialize = "columnType", deserialize = "type"))]
    pub column_type: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub length: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decimal: Option<u16>,

    #[serde(default)]
    pub unsigned: bool,

    #[serde(default)]
    pub not_null: bool,

    #[serde(default)]
    pub unique_key: bool,

    #[serde(default)]
    pub default_value: String,

    #[serde(default)]
    pub primary_key: bool,

    #[serde(default)]
    pub auto_increment: bool,

    #[serde(default)]
    pub referred_column: String,

    #[serde(default)]
    pub relationship: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Columns {
    #[serde(default)]
    #[serde(rename(serialize = "normalColumns", deserialize = "normal_column"))]
    pub normal_columns: Vec<NormalColumn>,

    #[serde(default)]
    #[serde(rename(serialize = "columnGroups", deserialize = "column_group"))]
    pub column_groups: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
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

    pub connections: Connections,

    pub columns: Columns,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct DiagramWalkers {
    #[serde(rename(serialize = "tables", deserialize = "table"))]
    pub tables: Vec<Table>,
}
