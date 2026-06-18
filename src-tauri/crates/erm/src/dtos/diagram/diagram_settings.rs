use crate::entities::diagram::diagram_settings as entities;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct DiagramSettings {
    pub database: String,
    pub view_mode: i64,
}

impl From<entities::DiagramSettings> for DiagramSettings {
    fn from(entity: entities::DiagramSettings) -> Self {
        Self {
            database: entity.database,
            view_mode: entity.view_mode,
        }
    }
}

impl From<DiagramSettings> for entities::DiagramSettings {
    fn from(dto: DiagramSettings) -> Self {
        Self {
            database: dto.database,
            view_mode: dto.view_mode,
        }
    }
}
