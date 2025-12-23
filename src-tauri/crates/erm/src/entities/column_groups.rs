use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default)]
    pub logical_name: String,

    #[serde(rename = "type")]
    pub column_type: String,

    #[serde(default)]
    pub not_null: bool,

    #[serde(default)]
    pub unique_key: bool,

    #[serde(default)]
    pub unsigned: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(rename = "normal_column")]
    pub normal_columns: Vec<NormalColumn>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ColumnGroup {
    pub column_group_name: String,
    pub columns: Columns,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ColumnGroups {
    #[serde(default)]
    #[serde(rename = "column_group")]
    pub column_groups: Vec<ColumnGroup>,
}
