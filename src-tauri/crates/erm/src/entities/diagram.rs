use super::column_groups::ColumnGroups;
use super::diagram_settings::DiagramSettings;
use super::diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
    pub column_groups: ColumnGroups,
}
