use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct DiagramSettings {
    // capital: bool,
    // notation_expand_group: bool,
    // table_style: String,
    pub database: String,
    // notation: String,
    // notation_level: u32,
    // view_mode: u32,
}

// impl DiagramSetting {
//     pub fn database(&self) -> &str {
//         &self.database
//     }
// }
