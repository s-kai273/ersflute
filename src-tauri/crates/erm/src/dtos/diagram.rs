pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;
pub mod vdiagrams;

use column_groups::ColumnGroup;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};
use vdiagrams::Vdiagram;

use super::{Identified, identified_from_entity, identified_into_entity};
use crate::identity::VisitIdentified;
use crate::validation::Validate;
use crate::validation::diagram::vdiagrams::{
    validate_duplicate_vdiagram_names, validate_duplicate_virtual_table_references,
    validate_virtual_table_references,
};
use crate::validation::diagram::{
    validate_column_group_column_length_and_decimal, validate_column_group_references,
    validate_duplicate_column_group_column_physical_names, validate_duplicate_column_group_names,
};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate, VisitIdentified)]
#[validate(rules(
    validate_duplicate_column_group_names,
    validate_duplicate_column_group_column_physical_names,
    validate_column_group_column_length_and_decimal,
    validate_column_group_references,
    validate_duplicate_vdiagram_names,
    validate_virtual_table_references,
    validate_duplicate_virtual_table_references
))]
#[serde(rename_all = "camelCase")]
pub struct Diagram {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub preserved_xml: Option<String>,

    pub diagram_settings: DiagramSettings,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diagram_walkers: Option<DiagramWalkers>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vdiagrams: Option<Vec<Identified<Vdiagram>>>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_groups: Option<Vec<Identified<ColumnGroup>>>,
}

impl From<crate::entities::diagram::Diagram> for Diagram {
    fn from(entity: crate::entities::diagram::Diagram) -> Self {
        Self {
            preserved_xml: None,
            diagram_settings: entity.diagram_settings.into(),
            diagram_walkers: entity.diagram_walkers.map(Into::into),
            vdiagrams: entity
                .vdiagrams
                .and_then(|vdiagrams| vdiagrams.vdiagrams)
                .map(|v| v.into_iter().map(identified_from_entity).collect()),
            column_groups: entity
                .column_groups
                .and_then(|groups| groups.column_groups)
                .map(|v| v.into_iter().map(identified_from_entity).collect()),
        }
    }
}

impl From<Diagram> for crate::entities::diagram::Diagram {
    fn from(dto: Diagram) -> Self {
        Self {
            diagram_settings: dto.diagram_settings.into(),
            diagram_walkers: dto.diagram_walkers.map(Into::into),
            vdiagrams: dto.vdiagrams.map(|vdiagrams| {
                crate::entities::diagram::vdiagrams::Vdiagrams {
                    vdiagrams: Some(vdiagrams.into_iter().map(identified_into_entity).collect()),
                }
            }),
            column_groups: dto.column_groups.map(|column_groups| {
                crate::entities::diagram::column_groups::ColumnGroups {
                    column_groups: Some(
                        column_groups
                            .into_iter()
                            .map(identified_into_entity)
                            .collect(),
                    ),
                }
            }),
        }
    }
}
