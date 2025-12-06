use super::{DiagramSettings, DiagramWalkers};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
}
