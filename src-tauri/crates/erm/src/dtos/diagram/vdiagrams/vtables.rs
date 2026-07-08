use crate::entities::diagram::vdiagrams::vtables as entities;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct VTable {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    pub table_id: String,
    pub x: u16,
    pub y: u16,
    pub font_name: String,
    pub font_size: u16,
}

impl From<entities::Vtable> for VTable {
    fn from(entity: entities::Vtable) -> Self {
        Self {
            identity_key: None,
            table_id: entity.table_id,
            x: entity.x,
            y: entity.y,
            font_name: entity.font_name,
            font_size: entity.font_size,
        }
    }
}

impl From<VTable> for entities::Vtable {
    fn from(dto: VTable) -> Self {
        Self {
            table_id: dto.table_id,
            x: dto.x,
            y: dto.y,
            font_name: dto.font_name,
            font_size: dto.font_size,
        }
    }
}
