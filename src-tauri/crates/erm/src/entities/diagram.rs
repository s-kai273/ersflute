use super::{DiagramSettings, DiagramWalkers};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
}
