pub mod vtables;

use crate::dtos::{Identified, identified_from_entity, identified_into_entity};
use crate::entities::diagram::vdiagrams as entities;
use crate::identity::VisitIdentified;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};
use vtables::Vtable;

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<entities::Color> for Color {
    fn from(entity: entities::Color) -> Self {
        Self {
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

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct WalkerNotes {}

impl From<entities::WalkerNotes> for WalkerNotes {
    fn from(_: entities::WalkerNotes) -> Self {
        Self {}
    }
}

impl From<WalkerNotes> for entities::WalkerNotes {
    fn from(_: WalkerNotes) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct WalkerGroups {}

impl From<entities::WalkerGroups> for WalkerGroups {
    fn from(_: entities::WalkerGroups) -> Self {
        Self {}
    }
}

impl From<WalkerGroups> for entities::WalkerGroups {
    fn from(_: WalkerGroups) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Vdiagram {
    pub vdiagram_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vtables: Option<Vec<Identified<Vtable>>>,
    pub walker_notes: WalkerNotes,
    pub walker_groups: WalkerGroups,
}

impl From<entities::Vdiagram> for Vdiagram {
    fn from(entity: entities::Vdiagram) -> Self {
        Self {
            vdiagram_name: entity.vdiagram_name,
            color: entity.color.map(Into::into),
            vtables: entity
                .vtables
                .vtables
                .map(|v| v.into_iter().map(identified_from_entity).collect()),
            walker_notes: entity.walker_notes.into(),
            walker_groups: entity.walker_groups.into(),
        }
    }
}

impl From<Vdiagram> for entities::Vdiagram {
    fn from(dto: Vdiagram) -> Self {
        Self {
            vdiagram_name: dto.vdiagram_name,
            color: dto.color.map(Into::into),
            vtables: entities::vtables::Vtables {
                vtables: dto
                    .vtables
                    .map(|v| v.into_iter().map(identified_into_entity).collect()),
            },
            walker_notes: dto.walker_notes.into(),
            walker_groups: dto.walker_groups.into(),
        }
    }
}
