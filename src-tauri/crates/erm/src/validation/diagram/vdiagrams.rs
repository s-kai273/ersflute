use std::collections::{HashMap, HashSet};

use crate::dtos::diagram::Diagram;
use crate::validation::ValidationError;

pub fn validate_duplicate_vdiagram_names(diagram: &Diagram) -> Result<(), ValidationError> {
    let Some(vdiagrams) = &diagram.vdiagrams else {
        return Ok(());
    };

    let mut vdiagram_names = HashMap::new();

    for (vdiagram_index, vdiagram) in vdiagrams.iter().enumerate() {
        if vdiagram_names
            .insert(vdiagram.vdiagram_name.as_str(), vdiagram)
            .is_some()
        {
            return Err(ValidationError::new(
                format!("vdiagrams.vdiagram[{vdiagram_index}].vdiagram_name"),
                format!("duplicate virtual diagram name: {}", vdiagram.vdiagram_name),
            )
            .with_target("virtual diagram name", vdiagram.vdiagram_name.as_str()));
        }
    }

    Ok(())
}

pub fn validate_virtual_table_references(diagram: &Diagram) -> Result<(), ValidationError> {
    let Some(vdiagrams) = &diagram.vdiagrams else {
        return Ok(());
    };

    let table_names = diagram
        .diagram_walkers
        .as_ref()
        .and_then(|diagram_walkers| diagram_walkers.tables.as_ref())
        .map(|tables| {
            tables
                .iter()
                .map(|table| table.physical_name.as_str())
                .collect::<HashSet<_>>()
        })
        .unwrap_or_default();

    for (vdiagram_index, vdiagram) in vdiagrams.iter().enumerate() {
        let Some(vtables) = &vdiagram.vtables else {
            continue;
        };

        for (vtable_index, vtable) in vtables.iter().enumerate() {
            let Some(table_name) = table_reference_name(&vtable.table_id) else {
                return Err(ValidationError::new(
                    virtual_table_id_path(vdiagram_index, vtable_index),
                    format!("invalid virtual table table_id: {}", vtable.table_id),
                )
                .with_target("virtual diagram name", vdiagram.vdiagram_name.as_str())
                .with_target("table id", vtable.table_id.as_str()));
            };

            if !table_names.contains(table_name) {
                return Err(ValidationError::new(
                    virtual_table_id_path(vdiagram_index, vtable_index),
                    format!("unknown virtual table table_id: {}", vtable.table_id),
                )
                .with_target("virtual diagram name", vdiagram.vdiagram_name.as_str())
                .with_target("table id", vtable.table_id.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_duplicate_virtual_table_references(
    diagram: &Diagram,
) -> Result<(), ValidationError> {
    let Some(vdiagrams) = &diagram.vdiagrams else {
        return Ok(());
    };

    for (vdiagram_index, vdiagram) in vdiagrams.iter().enumerate() {
        let Some(vtables) = &vdiagram.vtables else {
            continue;
        };

        let mut table_ids = HashMap::new();

        for (vtable_index, vtable) in vtables.iter().enumerate() {
            if table_ids.insert(vtable.table_id.as_str(), vtable).is_some() {
                return Err(ValidationError::new(
                    virtual_table_id_path(vdiagram_index, vtable_index),
                    format!("duplicate virtual table table_id: {}", vtable.table_id),
                )
                .with_target("virtual diagram name", vdiagram.vdiagram_name.as_str())
                .with_target("table id", vtable.table_id.as_str()));
            }
        }
    }

    Ok(())
}

fn table_reference_name(reference: &str) -> Option<&str> {
    let table_name = reference.strip_prefix("table.")?;

    if table_name.is_empty() {
        return None;
    }

    Some(table_name)
}

fn virtual_table_id_path(vdiagram_index: usize, vtable_index: usize) -> String {
    format!("vdiagrams.vdiagram[{vdiagram_index}].vtables.vtable[{vtable_index}].table_id")
}
