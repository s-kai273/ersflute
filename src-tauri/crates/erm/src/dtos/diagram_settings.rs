use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramSettings {
    pub database: String,
}

impl From<crate::entities::diagram_settings::DiagramSettings> for DiagramSettings {
    fn from(entity: crate::entities::diagram_settings::DiagramSettings) -> Self {
        Self {
            database: entity.database,
        }
    }
}
