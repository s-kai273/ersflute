pub use crate::column_type::ColumnType;

use crate::entities::diagram::diagram_walkers::tables::columns as entities;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Default, Validate)]
#[serde(rename_all = "camelCase")]
pub struct NormalColumn {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_type: Option<ColumnType>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub length: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decimal: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub args: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unsigned: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub not_null: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unique_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_increment: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relationship: Option<String>,
}

impl From<entities::NormalColumn> for NormalColumn {
    fn from(entity: entities::NormalColumn) -> Self {
        Self {
            identity_key: None,
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            description: entity.description,
            column_type: entity.column_type,
            length: entity.length,
            decimal: entity.decimal,
            args: entity.args,
            unsigned: entity.unsigned,
            not_null: entity.not_null,
            unique_key: entity.unique_key,
            default_value: entity.default_value,
            primary_key: entity.primary_key,
            auto_increment: entity.auto_increment,
            referred_column: entity.referred_column,
            relationship: entity.relationship,
        }
    }
}

impl From<NormalColumn> for entities::NormalColumn {
    fn from(dto: NormalColumn) -> Self {
        Self {
            physical_name: dto.physical_name,
            logical_name: dto.logical_name,
            description: dto.description,
            column_type: dto.column_type,
            length: dto.length,
            decimal: dto.decimal,
            args: dto.args,
            unsigned: dto.unsigned,
            not_null: dto.not_null,
            unique_key: dto.unique_key,
            default_value: dto.default_value,
            primary_key: dto.primary_key,
            auto_increment: dto.auto_increment,
            referred_column: dto.referred_column,
            relationship: dto.relationship,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(untagged)]
pub enum ColumnItem {
    Normal(NormalColumn),
    Group(String),
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub items: Option<Vec<ColumnItem>>,
}

impl From<entities::Columns> for Columns {
    fn from(entity: entities::Columns) -> Self {
        Self {
            identity_key: None,
            items: entity.items.map(|v| {
                v.into_iter()
                    .map(|item| match item {
                        entities::ColumnItem::Normal(column) => ColumnItem::Normal(column.into()),
                        entities::ColumnItem::Group(column) => ColumnItem::Group(column),
                    })
                    .collect()
            }),
        }
    }
}

impl From<Columns> for entities::Columns {
    fn from(dto: Columns) -> Self {
        Self {
            items: dto.items.map(|v| {
                v.into_iter()
                    .map(|item| match item {
                        ColumnItem::Normal(column) => entities::ColumnItem::Normal(column.into()),
                        ColumnItem::Group(column) => entities::ColumnItem::Group(column),
                    })
                    .collect()
            }),
        }
    }
}
