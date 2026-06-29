pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;
pub mod vdiagrams;

use crate::entities::XmlSchema;
use column_groups::ColumnGroups;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};
use vdiagrams::VDiagrams;

#[derive(Debug, PartialEq, Serialize, Deserialize, XmlSchema)]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diagram_walkers: Option<DiagramWalkers>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vdiagrams: Option<VDiagrams>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_groups: Option<ColumnGroups>,
}
