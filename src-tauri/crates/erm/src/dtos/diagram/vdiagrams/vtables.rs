use crate::entities::diagram::vdiagrams::vtables as entities;
use crate::identity::VisitIdentified;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[serde(rename_all = "camelCase")]
pub struct Vtable {
    pub table_id: String,
    pub x: u16,
    pub y: u16,
    pub font_name: String,
    pub font_size: u16,
}

impl From<entities::Vtable> for Vtable {
    fn from(entity: entities::Vtable) -> Self {
        Self {
            table_id: entity.table_id,
            x: entity.x,
            y: entity.y,
            font_name: entity.font_name,
            font_size: entity.font_size,
        }
    }
}

impl From<Vtable> for entities::Vtable {
    fn from(dto: Vtable) -> Self {
        Self {
            table_id: dto.table_id,
            x: dto.x,
            y: dto.y,
            font_name: dto.font_name,
            font_size: dto.font_size,
        }
    }
}
