pub mod columns;
pub mod compound_unique_key_list;
pub mod connections;
pub mod indexes;

use crate::entities::diagram::diagram_walkers::tables as entities;
use columns::Columns;
use compound_unique_key_list::CompoundUniqueKeyList;
use connections::Connections;
use indexes::Index;
use serde::{Deserialize, Serialize};

use crate::validation::Validate;
use crate::validation::diagram::diagram_walkers::tables::{
    validate_auto_increment_columns_are_key_columns, validate_column_length_and_decimal,
    validate_compound_unique_key_column_references, validate_duplicate_column_physical_names,
    validate_duplicate_compound_unique_key_names, validate_duplicate_index_names,
    validate_index_column_references, validate_local_relationship_consistency,
};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<entities::Color> for Color {
    fn from(entity: entities::Color) -> Self {
        Self {
            identity_key: None,
            r: entity.r,
            g: entity.g,
            b: entity.b,
        }
    }
}

impl From<Color> for entities::Color {
    fn from(dto: Color) -> Self {
        Self {
            r: dto.r,
            g: dto.g,
            b: dto.b,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[validate(rules(
    validate_duplicate_column_physical_names,
    validate_duplicate_index_names,
    validate_duplicate_compound_unique_key_names,
    validate_auto_increment_columns_are_key_columns,
    validate_column_length_and_decimal,
    validate_index_column_references,
    validate_compound_unique_key_column_references,
    validate_local_relationship_consistency
))]
#[serde(rename_all = "camelCase")]
pub struct Table {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    pub physical_name: String,

    pub logical_name: String,

    pub description: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub height: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub width: Option<u16>,

    pub font_name: String,

    pub font_size: u16,

    pub x: u16,

    pub y: u16,

    pub color: Color,

    pub connections: Connections,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub table_constraint: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_key_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub option: Option<String>,

    pub columns: Columns,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub indexes: Option<Vec<Index>>,

    pub compound_unique_key_list: CompoundUniqueKeyList,
}

impl From<entities::Table> for Table {
    fn from(entity: entities::Table) -> Self {
        Self {
            identity_key: None,
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            description: entity.description,
            height: entity.height,
            width: entity.width,
            font_name: entity.font_name,
            font_size: entity.font_size,
            x: entity.x,
            y: entity.y,
            color: entity.color.into(),
            connections: entity.connections.into(),
            table_constraint: entity.table_constraint,
            primary_key_name: entity.primary_key_name,
            option: entity.option,
            columns: entity.columns.into(),
            indexes: entity
                .indexes
                .indexes
                .map(|v| v.into_iter().map(Into::into).collect()),
            compound_unique_key_list: entity.compound_unique_key_list.into(),
        }
    }
}

impl From<Table> for entities::Table {
    fn from(dto: Table) -> Self {
        Self {
            physical_name: dto.physical_name,
            logical_name: dto.logical_name,
            description: dto.description,
            height: dto.height,
            width: dto.width,
            font_name: dto.font_name,
            font_size: dto.font_size,
            x: dto.x,
            y: dto.y,
            color: dto.color.into(),
            connections: dto.connections.into(),
            table_constraint: dto.table_constraint,
            primary_key_name: dto.primary_key_name,
            option: dto.option,
            columns: dto.columns.into(),
            indexes: entities::indexes::Indexes {
                indexes: dto.indexes.map(|v| v.into_iter().map(Into::into).collect()),
            },
            compound_unique_key_list: dto.compound_unique_key_list.into(),
            table_properties: entities::TableProperties {},
        }
    }
}
