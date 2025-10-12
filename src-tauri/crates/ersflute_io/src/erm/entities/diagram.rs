use super::diagram_settings::DiagramSettings;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
}
