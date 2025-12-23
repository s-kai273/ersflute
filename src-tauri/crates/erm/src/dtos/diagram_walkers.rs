use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<crate::entities::diagram_walkers::Color> for Color {
    fn from(entity: crate::entities::diagram_walkers::Color) -> Self {
        Self {
            r: entity.r,
            g: entity.g,
            b: entity.b,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FkColumn {
    pub fk_column_name: String,
}

impl From<crate::entities::diagram_walkers::FkColumn> for FkColumn {
    fn from(entity: crate::entities::diagram_walkers::FkColumn) -> Self {
        Self {
            fk_column_name: entity.fk_column_name,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

impl From<crate::entities::diagram_walkers::FkColumns> for FkColumns {
    fn from(entity: crate::entities::diagram_walkers::FkColumns) -> Self {
        Self {
            fk_column: entity.fk_column.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

impl From<crate::entities::diagram_walkers::Relationship> for Relationship {
    fn from(entity: crate::entities::diagram_walkers::Relationship) -> Self {
        Self {
            name: entity.name,
            source: entity.source,
            target: entity.target,
            fk_columns: entity.fk_columns.into(),
            parent_cardinality: entity.parent_cardinality,
            child_cardinality: entity.child_cardinality,
            reference_for_pk: entity.reference_for_pk,
            on_delete_action: entity.on_delete_action,
            on_update_action: entity.on_update_action,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Connections {
    #[serde(default)]
    pub relationships: Vec<Relationship>,
}

impl From<crate::entities::diagram_walkers::Connections> for Connections {
    fn from(entity: crate::entities::diagram_walkers::Connections) -> Self {
        Self {
            relationships: entity.relationship.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default)]
    pub logical_name: String,

    #[serde(default)]
    pub description: String,

    #[serde(default)]
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

impl From<crate::entities::diagram_walkers::NormalColumn> for NormalColumn {
    fn from(entity: crate::entities::diagram_walkers::NormalColumn) -> Self {
        Self {
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            description: entity.description,
            column_type: entity.column_type,
            length: entity.length,
            decimal: entity.decimal,
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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Columns {
    #[serde(default)]
    pub normal_columns: Vec<NormalColumn>,

    #[serde(default)]
    pub column_groups: Vec<String>,
}

impl From<crate::entities::diagram_walkers::Columns> for Columns {
    fn from(entity: crate::entities::diagram_walkers::Columns) -> Self {
        Self {
            normal_columns: entity.normal_columns.into_iter().map(Into::into).collect(),
            column_groups: entity.column_groups,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

impl From<crate::entities::diagram_walkers::Table> for Table {
    fn from(entity: crate::entities::diagram_walkers::Table) -> Self {
        Self {
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
            columns: entity.columns.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramWalkers {
    pub tables: Vec<Table>,
}

impl From<crate::entities::diagram_walkers::DiagramWalkers> for DiagramWalkers {
    fn from(entity: crate::entities::diagram_walkers::DiagramWalkers) -> Self {
        Self {
            tables: entity.tables.into_iter().map(Into::into).collect(),
        }
    }
}
