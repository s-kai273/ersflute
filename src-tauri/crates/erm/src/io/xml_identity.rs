use super::xml_preservation::XmlNodeIdentity;
use crate::dtos::diagram::{self as dto, Diagram};
use crate::entities::XmlSchema as _;
use std::collections::HashMap;

type IdentityIndexLookup<'a> = HashMap<(&'a str, Option<&'a str>, usize), &'a str>;

pub(crate) fn attach_identity_keys(diagram: &mut Diagram, identities: &[XmlNodeIdentity]) {
    let lookup = identity_index_lookup(identities);

    if let Some(diagram_walkers) = &mut diagram.diagram_walkers {
        attach_diagram_walkers_identity_keys(diagram_walkers, &lookup);
    }

    if let Some(vdiagrams) = &mut diagram.vdiagrams {
        for (index, vdiagram) in vdiagrams.iter_mut().enumerate() {
            vdiagram.identity_key =
                identity_key_for_child("vdiagrams", "vdiagram", None, index, &lookup);
            attach_vdiagram_identity_keys(vdiagram, &lookup);
        }
    }

    if let Some(column_groups) = &mut diagram.column_groups {
        for (index, column_group) in column_groups.iter_mut().enumerate() {
            column_group.identity_key =
                identity_key_for_child("column_groups", "column_group", None, index, &lookup);
            attach_column_group_identity_keys(column_group, &lookup);
        }
    }
}

pub(crate) fn collect_identity_keys(diagram: &Diagram) -> Vec<XmlNodeIdentity> {
    let mut identities = Vec::new();

    if let Some(diagram_walkers) = &diagram.diagram_walkers {
        collect_diagram_walkers_identity_keys(diagram_walkers, &mut identities);
    }

    if let Some(vdiagrams) = &diagram.vdiagrams {
        for (index, vdiagram) in vdiagrams.iter().enumerate() {
            push_identity_for_child(
                &mut identities,
                "vdiagrams",
                "vdiagram",
                None,
                index,
                vdiagram.identity_key.as_deref(),
            );
            collect_vdiagram_identity_keys(vdiagram, &mut identities);
        }
    }

    if let Some(column_groups) = &diagram.column_groups {
        for (index, column_group) in column_groups.iter().enumerate() {
            push_identity_for_child(
                &mut identities,
                "column_groups",
                "column_group",
                None,
                index,
                column_group.identity_key.as_deref(),
            );
            collect_column_group_identity_keys(column_group, &mut identities);
        }
    }

    identities
}

fn attach_diagram_walkers_identity_keys(
    diagram_walkers: &mut dto::diagram_walkers::DiagramWalkers,
    lookup: &IdentityIndexLookup<'_>,
) {
    if let Some(tables) = &mut diagram_walkers.tables {
        for (index, table) in tables.iter_mut().enumerate() {
            table.identity_key =
                identity_key_for_child("diagram_walkers", "table", None, index, lookup);
            attach_table_identity_keys(table, lookup);
        }
    }
}

fn collect_diagram_walkers_identity_keys(
    diagram_walkers: &dto::diagram_walkers::DiagramWalkers,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    if let Some(tables) = &diagram_walkers.tables {
        for (index, table) in tables.iter().enumerate() {
            push_identity_for_child(
                identities,
                "diagram_walkers",
                "table",
                None,
                index,
                table.identity_key.as_deref(),
            );
            collect_table_identity_keys(table, identities);
        }
    }
}

fn attach_table_identity_keys(
    table: &mut dto::diagram_walkers::tables::Table,
    lookup: &IdentityIndexLookup<'_>,
) {
    let parent_id = table.identity_key.clone();
    let parent_id = parent_id.as_deref();

    attach_connections_identity_keys(&mut table.connections, parent_id, lookup);
    attach_table_columns_identity_keys(&mut table.columns, parent_id, lookup);
    attach_table_indexes_identity_keys(&mut table.indexes, parent_id, lookup);
    attach_compound_unique_key_list_identity_keys(
        &mut table.compound_unique_key_list,
        parent_id,
        lookup,
    );
}

fn collect_table_identity_keys(
    table: &dto::diagram_walkers::tables::Table,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    let parent_id = table.identity_key.as_deref();

    collect_connections_identity_keys(&table.connections, parent_id, identities);
    collect_table_columns_identity_keys(&table.columns, parent_id, identities);
    collect_table_indexes_identity_keys(&table.indexes, parent_id, identities);
    collect_compound_unique_key_list_identity_keys(
        &table.compound_unique_key_list,
        parent_id,
        identities,
    );
}

fn attach_table_columns_identity_keys(
    columns: &mut dto::diagram_walkers::tables::columns::Columns,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) {
    let Some(items) = &mut columns.items else {
        return;
    };

    let mut normal_column_index = 0;
    for item in items {
        let dto::diagram_walkers::tables::columns::ColumnItem::Normal(column) = item else {
            continue;
        };
        column.identity_key = identity_key_for_child(
            "columns",
            "normal_column",
            repeated_parent_id,
            normal_column_index,
            lookup,
        );
        normal_column_index += 1;
    }
}

fn collect_table_columns_identity_keys(
    columns: &dto::diagram_walkers::tables::columns::Columns,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    let Some(items) = &columns.items else {
        return;
    };

    let mut normal_column_index = 0;
    for item in items {
        let dto::diagram_walkers::tables::columns::ColumnItem::Normal(column) = item else {
            continue;
        };
        push_identity_for_child(
            identities,
            "columns",
            "normal_column",
            repeated_parent_id,
            normal_column_index,
            column.identity_key.as_deref(),
        );
        normal_column_index += 1;
    }
}

fn attach_connections_identity_keys(
    connections: &mut dto::diagram_walkers::tables::connections::Connections,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) {
    if let Some(relationships) = &mut connections.relationships {
        for (index, relationship) in relationships.iter_mut().enumerate() {
            relationship.identity_key = identity_key_for_child(
                "connections",
                "relationship",
                repeated_parent_id,
                index,
                lookup,
            );
        }
    }
}

fn collect_connections_identity_keys(
    connections: &dto::diagram_walkers::tables::connections::Connections,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    if let Some(relationships) = &connections.relationships {
        for (index, relationship) in relationships.iter().enumerate() {
            push_identity_for_child(
                identities,
                "connections",
                "relationship",
                repeated_parent_id,
                index,
                relationship.identity_key.as_deref(),
            );
        }
    }
}

fn attach_table_indexes_identity_keys(
    indexes: &mut Option<Vec<dto::diagram_walkers::tables::indexes::Index>>,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) {
    if let Some(indexes) = indexes {
        for (index, index_dto) in indexes.iter_mut().enumerate() {
            index_dto.identity_key =
                identity_key_for_child("indexes", "index", repeated_parent_id, index, lookup);
        }
    }
}

fn collect_table_indexes_identity_keys(
    indexes: &Option<Vec<dto::diagram_walkers::tables::indexes::Index>>,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    if let Some(indexes) = indexes {
        for (index, index_dto) in indexes.iter().enumerate() {
            push_identity_for_child(
                identities,
                "indexes",
                "index",
                repeated_parent_id,
                index,
                index_dto.identity_key.as_deref(),
            );
        }
    }
}

fn attach_compound_unique_key_list_identity_keys(
    keys: &mut dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) {
    if let Some(keys) = &mut keys.compound_unique_keys {
        for (index, key) in keys.iter_mut().enumerate() {
            key.identity_key = identity_key_for_child(
                "compound_unique_key_list",
                "compound_unique_key",
                repeated_parent_id,
                index,
                lookup,
            );
        }
    }
}

fn collect_compound_unique_key_list_identity_keys(
    keys: &dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    if let Some(keys) = &keys.compound_unique_keys {
        for (index, key) in keys.iter().enumerate() {
            push_identity_for_child(
                identities,
                "compound_unique_key_list",
                "compound_unique_key",
                repeated_parent_id,
                index,
                key.identity_key.as_deref(),
            );
        }
    }
}

fn attach_vdiagram_identity_keys(
    vdiagram: &mut dto::vdiagrams::VDiagram,
    lookup: &IdentityIndexLookup<'_>,
) {
    let parent_id = vdiagram.identity_key.clone();
    let parent_id = parent_id.as_deref();

    if let Some(vtables) = &mut vdiagram.vtables {
        for (index, vtable) in vtables.iter_mut().enumerate() {
            vtable.identity_key =
                identity_key_for_child("vtables", "vtable", parent_id, index, lookup);
        }
    }
}

fn collect_vdiagram_identity_keys(
    vdiagram: &dto::vdiagrams::VDiagram,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    let parent_id = vdiagram.identity_key.as_deref();

    if let Some(vtables) = &vdiagram.vtables {
        for (index, vtable) in vtables.iter().enumerate() {
            push_identity_for_child(
                identities,
                "vtables",
                "vtable",
                parent_id,
                index,
                vtable.identity_key.as_deref(),
            );
        }
    }
}

fn attach_column_group_identity_keys(
    column_group: &mut dto::column_groups::ColumnGroup,
    lookup: &IdentityIndexLookup<'_>,
) {
    let parent_id = column_group.identity_key.clone();
    attach_column_group_columns_identity_keys(
        &mut column_group.columns,
        parent_id.as_deref(),
        lookup,
    );
}

fn collect_column_group_identity_keys(
    column_group: &dto::column_groups::ColumnGroup,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    collect_column_group_columns_identity_keys(
        &column_group.columns,
        column_group.identity_key.as_deref(),
        identities,
    );
}

fn attach_column_group_columns_identity_keys(
    columns: &mut dto::column_groups::Columns,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) {
    if let Some(columns) = &mut columns.normal_columns {
        for (index, column) in columns.iter_mut().enumerate() {
            column.identity_key = identity_key_for_child(
                "columns",
                "normal_column",
                repeated_parent_id,
                index,
                lookup,
            );
        }
    }
}

fn collect_column_group_columns_identity_keys(
    columns: &dto::column_groups::Columns,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    if let Some(columns) = &columns.normal_columns {
        for (index, column) in columns.iter().enumerate() {
            push_identity_for_child(
                identities,
                "columns",
                "normal_column",
                repeated_parent_id,
                index,
                column.identity_key.as_deref(),
            );
        }
    }
}

fn identity_index_lookup(identities: &[XmlNodeIdentity]) -> IdentityIndexLookup<'_> {
    identities
        .iter()
        .map(|identity| {
            (
                (
                    identity.tag.as_str(),
                    identity.parent_id.as_deref(),
                    identity.index,
                ),
                identity.id.as_str(),
            )
        })
        .collect()
}

fn lookup_identity_key(
    tag: &str,
    parent_id: Option<&str>,
    index: usize,
    lookup: &IdentityIndexLookup<'_>,
) -> Option<String> {
    lookup
        .get(&(tag, parent_id, index))
        .map(|id| (*id).to_string())
}

fn identity_key_for_child(
    parent_tag: &str,
    child_tag: &str,
    repeated_parent_id: Option<&str>,
    index: usize,
    lookup: &IdentityIndexLookup<'_>,
) -> Option<String> {
    is_identity_child(parent_tag, child_tag)
        .then(|| lookup_identity_key(child_tag, repeated_parent_id, index, lookup))
        .flatten()
}

fn push_identity_for_child(
    identities: &mut Vec<XmlNodeIdentity>,
    parent_tag: &str,
    child_tag: &str,
    repeated_parent_id: Option<&str>,
    index: usize,
    identity_key: Option<&str>,
) {
    if !is_identity_child(parent_tag, child_tag) {
        return;
    }

    let Some(identity_key) = identity_key else {
        return;
    };

    identities.push(XmlNodeIdentity {
        id: identity_key.to_string(),
        tag: child_tag.to_string(),
        parent_id: repeated_parent_id.map(str::to_string),
        index,
    });
}

fn is_identity_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_identity_child(parent, tag)
}
