use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(rename(serialize = "columnType", deserialize = "type"))]
    pub column_type: String,

    #[serde(default)]
    pub not_null: bool,

    #[serde(default)]
    pub unique_key: bool,

    #[serde(default)]
    pub unsigned: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Columns {
    #[serde(rename(serialize = "normalColumns", deserialize = "normal_column"))]
    pub normal_columns: Vec<NormalColumn>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct ColumnGroup {
    pub column_group_name: String,
    pub columns: Columns,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct ColumnGroups {
    #[serde(rename(serialize = "columnGroups", deserialize = "column_group"))]
    pub column_groups: Vec<ColumnGroup>,
}
