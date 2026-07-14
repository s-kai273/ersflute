pub use crate::entities::diagram::diagram_walkers::tables::connections::{
    ChildCardinality, OnAction, ParentCardinality,
};

use crate::dtos::{Identified, identified_from_entity, identified_into_entity};
use crate::entities::diagram::diagram_walkers::tables::connections as entities;
use crate::identity::VisitIdentified;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Bendpoint {
    pub relative: bool,
    pub x: u16,
    pub y: u16,
}

impl From<entities::Bendpoint> for Bendpoint {
    fn from(entity: entities::Bendpoint) -> Self {
        Self {
            relative: entity.relative,
            x: entity.x,
            y: entity.y,
        }
    }
}

impl From<Bendpoint> for entities::Bendpoint {
    fn from(dto: Bendpoint) -> Self {
        Self {
            relative: dto.relative,
            x: dto.x,
            y: dto.y,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct FkColumn {
    pub fk_column_name: String,
}

impl From<entities::FkColumn> for FkColumn {
    fn from(entity: entities::FkColumn) -> Self {
        Self {
            fk_column_name: entity.fk_column_name,
        }
    }
}

impl From<FkColumn> for entities::FkColumn {
    fn from(dto: FkColumn) -> Self {
        Self {
            fk_column_name: dto.fk_column_name,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

impl From<entities::FkColumns> for FkColumns {
    fn from(entity: entities::FkColumns) -> Self {
        Self {
            fk_column: entity.fk_column.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<FkColumns> for entities::FkColumns {
    fn from(dto: FkColumns) -> Self {
        Self {
            fk_column: dto.fk_column.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Relationship {
    pub name: String,

    pub source: String,

    pub target: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bendpoints: Option<Vec<Bendpoint>>,

    pub fk_columns: FkColumns,

    pub parent_cardinality: ParentCardinality,

    pub child_cardinality: ChildCardinality,

    pub reference_for_pk: bool,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_delete_action: Option<OnAction>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_update_action: Option<OnAction>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_simple_unique_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_compound_unique_key: Option<String>,
}

impl From<entities::Relationship> for Relationship {
    fn from(entity: entities::Relationship) -> Self {
        Self {
            name: entity.name,
            source: entity.source,
            target: entity.target,
            bendpoints: entity
                .bendpoints
                .map(|v| v.into_iter().map(Into::into).collect()),
            fk_columns: entity.fk_columns.into(),
            parent_cardinality: entity.parent_cardinality,
            child_cardinality: entity.child_cardinality,
            reference_for_pk: entity.reference_for_pk,
            on_delete_action: entity.on_delete_action,
            on_update_action: entity.on_update_action,
            referred_simple_unique_column: entity.referred_simple_unique_column,
            referred_compound_unique_key: entity.referred_compound_unique_key,
        }
    }
}

impl From<Relationship> for entities::Relationship {
    fn from(dto: Relationship) -> Self {
        Self {
            name: dto.name,
            source: dto.source,
            target: dto.target,
            bendpoints: dto
                .bendpoints
                .map(|v| v.into_iter().map(Into::into).collect()),
            fk_columns: dto.fk_columns.into(),
            parent_cardinality: dto.parent_cardinality,
            child_cardinality: dto.child_cardinality,
            reference_for_pk: dto.reference_for_pk,
            on_delete_action: dto.on_delete_action,
            on_update_action: dto.on_update_action,
            referred_simple_unique_column: dto.referred_simple_unique_column,
            referred_compound_unique_key: dto.referred_compound_unique_key,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Connections {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relationships: Option<Vec<Identified<Relationship>>>,
}

impl From<entities::Connections> for Connections {
    fn from(entity: entities::Connections) -> Self {
        Self {
            relationships: entity
                .relationships
                .map(|v| v.into_iter().map(identified_from_entity).collect()),
        }
    }
}

impl From<Connections> for entities::Connections {
    fn from(dto: Connections) -> Self {
        Self {
            relationships: dto
                .relationships
                .map(|v| v.into_iter().map(identified_into_entity).collect()),
        }
    }
}
