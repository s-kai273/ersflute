use crate::entities::diagram::diagram_settings as entities;
use crate::validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct DiagramSettings {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    pub database: String,
    pub view_mode: i64,
}

impl From<entities::DiagramSettings> for DiagramSettings {
    fn from(entity: entities::DiagramSettings) -> Self {
        Self {
            identity_key: None,
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
