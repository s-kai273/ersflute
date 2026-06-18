use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DiagramSettings {
    pub database: String,
    pub view_mode: i64,
}
