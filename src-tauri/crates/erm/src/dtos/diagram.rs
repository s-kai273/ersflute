use super::column_groups::ColumnGroups;
use super::diagram_settings::DiagramSettings;
use super::diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
    pub column_groups: ColumnGroups,
}

impl From<crate::entities::diagram::Diagram> for Diagram {
    fn from(entity: crate::entities::diagram::Diagram) -> Self {
        Self {
            diagram_settings: entity.diagram_settings.into(),
            diagram_walkers: entity.diagram_walkers.into(),
            column_groups: entity.column_groups.into(),
        }
    }
}
