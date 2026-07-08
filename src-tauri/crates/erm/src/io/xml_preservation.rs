use crate::dtos::diagram::{self as dto, Diagram};
use crate::entities::XmlSchema as _;
use crate::entities::diagram as entity;
use crate::errors::Error;
use quick_xml::events::{BytesEnd, BytesStart, Event};
use quick_xml::{Reader, Writer};
use std::collections::{HashMap, HashSet};

type IdentityIndexLookup<'a> = HashMap<(&'a str, Option<&'a str>, usize), &'a str>;

#[derive(Clone)]
pub(crate) struct XmlNodeIdentity {
    id: String,
    tag: String,
    parent_id: Option<String>,
    index: usize,
}

// This module applies managed DTO changes to the original XML without
// normalizing the whole file. It keeps raw XML events for unsupported content
// and uses schema metadata plus saved identities to match repeated elements.
#[derive(Clone)]
enum XmlNode {
    // Schema-aware XML element that can be merged with managed output.
    Element(XmlElement),
    // Byte-preserved XML event such as whitespace, text, or comments.
    Raw(Vec<u8>),
}

#[derive(Clone)]
struct XmlElement {
    name: String,
    start: BytesStart<'static>,
    end: Option<BytesEnd<'static>>,
    children: Vec<XmlNode>,
    // Temporary merge key for repeated elements. This is not written to XML.
    identity_id: Option<String>,
}

// Merges freshly serialized managed XML into the preserved source XML.
pub(crate) fn merge_preserved_xml(
    preserved_xml: &str,
    managed_xml: &str,
    identities: &[XmlNodeIdentity],
) -> Result<String, Error> {
    let mut base = parse_document(preserved_xml)?;
    let mut managed = parse_document(managed_xml)?;
    assign_managed_identities(&mut managed, identities);
    assign_source_identities(&mut base);

    let merged = merge_element(base, managed);
    let mut writer = Writer::new(Vec::new());
    write_element(&mut writer, &merged)?;
    Ok(String::from_utf8(writer.into_inner()).expect("quick-xml wrote invalid UTF-8"))
}

// Converts an entity into a DTO while keeping the source XML needed for
// merge-based saves. Stable source identities are attached to repeated DTO
// elements before edits can change their ordering.
pub(crate) fn diagram_from_entity_with_preserved_xml(
    entity: crate::entities::diagram::Diagram,
    xml: String,
) -> Result<Diagram, Error> {
    let identities = collect_xml_node_identities(&xml)?;
    let lookup = identity_index_lookup(&identities);
    let mut diagram = diagram_from_entity(entity, &lookup);
    diagram.preserved_xml = Some(xml);
    Ok(diagram)
}

// Converts a DTO into an entity while collecting identity keys in the DTO's
// current order. The merge step uses these keys to match reordered managed XML
// elements with their preserved source counterparts.
pub(crate) fn diagram_into_entity_with_identity_keys(
    diagram: Diagram,
) -> (crate::entities::diagram::Diagram, Vec<XmlNodeIdentity>) {
    let mut identities = Vec::new();
    let entity = diagram_into_entity(diagram, &mut identities);
    (entity, identities)
}

// Captures stable identities from source XML before DTO edits change ordering.
fn collect_xml_node_identities(xml: &str) -> Result<Vec<XmlNodeIdentity>, Error> {
    let root = parse_document(xml)?;
    let mut identities = Vec::new();
    collect_identities(&root, None, &mut Vec::new(), &mut identities);
    Ok(identities)
}

// Walks the source XML tree and records identity children by tag/index under
// the nearest repeated parent.
fn collect_identities(
    element: &XmlElement,
    repeated_parent_id: Option<&str>,
    path: &mut Vec<usize>,
    identities: &mut Vec<XmlNodeIdentity>,
) {
    let mut tag_indexes: HashMap<&str, usize> = HashMap::new();
    for (element_index, child) in element
        .children
        .iter()
        .filter_map(|child| match child {
            XmlNode::Element(element) => Some(element),
            XmlNode::Raw(_) => None,
        })
        .enumerate()
    {
        path.push(element_index);
        let index = tag_indexes.entry(&child.name).or_default();
        let id = path_id(path);

        let next_parent = if is_identity_child(&element.name, &child.name) {
            identities.push(XmlNodeIdentity {
                id: id.clone(),
                tag: child.name.clone(),
                parent_id: repeated_parent_id.map(str::to_string),
                index: *index,
            });
            Some(id.as_str())
        } else {
            repeated_parent_id
        };
        collect_identities(child, next_parent, path, identities);
        *index += 1;
        path.pop();
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

fn push_identity(
    identities: &mut Vec<XmlNodeIdentity>,
    tag: &str,
    parent_id: Option<&str>,
    index: usize,
    identity_key: Option<&str>,
) {
    let Some(identity_key) = identity_key else {
        return;
    };

    identities.push(XmlNodeIdentity {
        id: identity_key.to_string(),
        tag: tag.to_string(),
        parent_id: parent_id.map(str::to_string),
        index,
    });
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
    if is_identity_child(parent_tag, child_tag) {
        push_identity(
            identities,
            child_tag,
            repeated_parent_id,
            index,
            identity_key,
        );
    }
}

fn diagram_from_entity(entity: entity::Diagram, lookup: &IdentityIndexLookup<'_>) -> Diagram {
    Diagram {
        identity_key: None,
        preserved_xml: None,
        diagram_settings: entity.diagram_settings.into(),
        diagram_walkers: entity
            .diagram_walkers
            .map(|diagram_walkers| diagram_walkers_from_entity(diagram_walkers, lookup)),
        vdiagrams: entity
            .vdiagrams
            .and_then(|vdiagrams| vdiagrams.vdiagrams)
            .map(|vdiagrams| {
                vdiagrams
                    .into_iter()
                    .enumerate()
                    .map(|(index, vdiagram)| {
                        let identity_key =
                            identity_key_for_child("vdiagrams", "vdiagram", None, index, lookup);
                        vdiagram_from_entity(vdiagram, identity_key, lookup)
                    })
                    .collect()
            }),
        column_groups: entity
            .column_groups
            .and_then(|column_groups| column_groups.column_groups)
            .map(|column_groups| {
                column_groups
                    .into_iter()
                    .enumerate()
                    .map(|(index, column_group)| {
                        let identity_key = identity_key_for_child(
                            "column_groups",
                            "column_group",
                            None,
                            index,
                            lookup,
                        );
                        column_group_from_entity(column_group, identity_key, lookup)
                    })
                    .collect()
            }),
    }
}

fn diagram_walkers_from_entity(
    entity: entity::diagram_walkers::DiagramWalkers,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::diagram_walkers::DiagramWalkers {
    dto::diagram_walkers::DiagramWalkers {
        identity_key: None,
        tables: entity.tables.map(|tables| {
            tables
                .into_iter()
                .enumerate()
                .map(|(index, table)| {
                    let identity_key =
                        identity_key_for_child("diagram_walkers", "table", None, index, lookup);
                    table_from_entity(table, identity_key, lookup)
                })
                .collect()
        }),
    }
}

fn table_from_entity(
    entity: entity::diagram_walkers::tables::Table,
    identity_key: Option<String>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::diagram_walkers::tables::Table {
    let parent_id_key = identity_key.clone();
    let parent_id = parent_id_key.as_deref();
    dto::diagram_walkers::tables::Table {
        identity_key,
        physical_name: entity.physical_name,
        logical_name: entity.logical_name,
        description: entity.description,
        height: entity.height,
        width: entity.width,
        font_name: entity.font_name,
        font_size: entity.font_size,
        x: entity.x,
        y: entity.y,
        color: entity.color.into(),
        connections: connections_from_entity(entity.connections, parent_id, lookup),
        table_constraint: entity.table_constraint,
        primary_key_name: entity.primary_key_name,
        option: entity.option,
        columns: table_columns_from_entity(entity.columns, parent_id, lookup),
        indexes: entity.indexes.indexes.map(|indexes| {
            indexes
                .into_iter()
                .enumerate()
                .map(|(index, index_entity)| {
                    let identity_key =
                        identity_key_for_child("indexes", "index", parent_id, index, lookup);
                    index_from_entity(index_entity, identity_key)
                })
                .collect()
        }),
        compound_unique_key_list: compound_unique_key_list_from_entity(
            entity.compound_unique_key_list,
            parent_id,
            lookup,
        ),
    }
}

fn table_columns_from_entity(
    entity: entity::diagram_walkers::tables::columns::Columns,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::diagram_walkers::tables::columns::Columns {
    dto::diagram_walkers::tables::columns::Columns {
        identity_key: None,
        items: entity.items.map(|items| {
            let mut normal_column_index = 0;
            items
                .into_iter()
                .map(|item| match item {
                    entity::diagram_walkers::tables::columns::ColumnItem::Normal(column) => {
                        let identity_key = identity_key_for_child(
                            "columns",
                            "normal_column",
                            repeated_parent_id,
                            normal_column_index,
                            lookup,
                        );
                        normal_column_index += 1;
                        dto::diagram_walkers::tables::columns::ColumnItem::Normal(
                            table_normal_column_from_entity(column, identity_key),
                        )
                    }
                    entity::diagram_walkers::tables::columns::ColumnItem::Group(column_group) => {
                        dto::diagram_walkers::tables::columns::ColumnItem::Group(column_group)
                    }
                })
                .collect()
        }),
    }
}

fn table_normal_column_from_entity(
    entity: entity::diagram_walkers::tables::columns::NormalColumn,
    identity_key: Option<String>,
) -> dto::diagram_walkers::tables::columns::NormalColumn {
    let mut dto = dto::diagram_walkers::tables::columns::NormalColumn::from(entity);
    dto.identity_key = identity_key;
    dto
}

fn connections_from_entity(
    entity: entity::diagram_walkers::tables::connections::Connections,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::diagram_walkers::tables::connections::Connections {
    dto::diagram_walkers::tables::connections::Connections {
        identity_key: None,
        relationships: entity.relationships.map(|relationships| {
            relationships
                .into_iter()
                .enumerate()
                .map(|(index, relationship)| {
                    let identity_key = identity_key_for_child(
                        "connections",
                        "relationship",
                        repeated_parent_id,
                        index,
                        lookup,
                    );
                    relationship_from_entity(relationship, identity_key)
                })
                .collect()
        }),
    }
}

fn relationship_from_entity(
    entity: entity::diagram_walkers::tables::connections::Relationship,
    identity_key: Option<String>,
) -> dto::diagram_walkers::tables::connections::Relationship {
    let mut dto = dto::diagram_walkers::tables::connections::Relationship::from(entity);
    dto.identity_key = identity_key;
    dto
}

fn index_from_entity(
    entity: entity::diagram_walkers::tables::indexes::Index,
    identity_key: Option<String>,
) -> dto::diagram_walkers::tables::indexes::Index {
    let mut dto = dto::diagram_walkers::tables::indexes::Index::from(entity);
    dto.identity_key = identity_key;
    dto
}

fn compound_unique_key_list_from_entity(
    entity: entity::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList {
    dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList {
        identity_key: None,
        compound_unique_keys: entity.compound_unique_keys.map(|keys| {
            keys.into_iter()
                .enumerate()
                .map(|(index, key)| {
                    let identity_key = identity_key_for_child(
                        "compound_unique_key_list",
                        "compound_unique_key",
                        repeated_parent_id,
                        index,
                        lookup,
                    );
                    compound_unique_key_from_entity(key, identity_key)
                })
                .collect()
        }),
    }
}

fn compound_unique_key_from_entity(
    entity: entity::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKey,
    identity_key: Option<String>,
) -> dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKey {
    let mut dto =
        dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKey::from(entity);
    dto.identity_key = identity_key;
    dto
}

fn vdiagram_from_entity(
    entity: entity::vdiagrams::Vdiagram,
    identity_key: Option<String>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::vdiagrams::VDiagram {
    let parent_id_key = identity_key.clone();
    let parent_id = parent_id_key.as_deref();
    dto::vdiagrams::VDiagram {
        identity_key,
        vdiagram_name: entity.vdiagram_name,
        color: entity.color.map(Into::into),
        vtables: entity.vtables.vtables.map(|vtables| {
            vtables
                .into_iter()
                .enumerate()
                .map(|(index, vtable)| {
                    let identity_key =
                        identity_key_for_child("vtables", "vtable", parent_id, index, lookup);
                    let mut dto = dto::vdiagrams::vtables::VTable::from(vtable);
                    dto.identity_key = identity_key;
                    dto
                })
                .collect()
        }),
        walker_notes: entity.walker_notes.into(),
        walker_groups: entity.walker_groups.into(),
    }
}

fn column_group_from_entity(
    entity: entity::column_groups::ColumnGroup,
    identity_key: Option<String>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::column_groups::ColumnGroup {
    let parent_id_key = identity_key.clone();
    let parent_id = parent_id_key.as_deref();
    dto::column_groups::ColumnGroup {
        identity_key,
        column_group_name: entity.column_group_name,
        columns: column_group_columns_from_entity(entity.columns, parent_id, lookup),
    }
}

fn column_group_columns_from_entity(
    entity: entity::column_groups::Columns,
    repeated_parent_id: Option<&str>,
    lookup: &IdentityIndexLookup<'_>,
) -> dto::column_groups::Columns {
    dto::column_groups::Columns {
        identity_key: None,
        normal_columns: entity.normal_columns.map(|columns| {
            columns
                .into_iter()
                .enumerate()
                .map(|(index, column)| {
                    let identity_key = identity_key_for_child(
                        "columns",
                        "normal_column",
                        repeated_parent_id,
                        index,
                        lookup,
                    );
                    let mut dto = dto::column_groups::NormalColumn::from(column);
                    dto.identity_key = identity_key;
                    dto
                })
                .collect()
        }),
    }
}

fn diagram_into_entity(dto: Diagram, identities: &mut Vec<XmlNodeIdentity>) -> entity::Diagram {
    entity::Diagram {
        diagram_settings: dto.diagram_settings.into(),
        diagram_walkers: dto
            .diagram_walkers
            .map(|diagram_walkers| diagram_walkers_into_entity(diagram_walkers, identities)),
        vdiagrams: dto.vdiagrams.map(|vdiagrams| entity::vdiagrams::Vdiagrams {
            vdiagrams: Some(
                vdiagrams
                    .into_iter()
                    .enumerate()
                    .map(|(index, vdiagram)| {
                        push_identity_for_child(
                            identities,
                            "vdiagrams",
                            "vdiagram",
                            None,
                            index,
                            vdiagram.identity_key.as_deref(),
                        );
                        vdiagram_into_entity(vdiagram, identities)
                    })
                    .collect(),
            ),
        }),
        column_groups: dto
            .column_groups
            .map(|column_groups| entity::column_groups::ColumnGroups {
                column_groups: Some(
                    column_groups
                        .into_iter()
                        .enumerate()
                        .map(|(index, column_group)| {
                            push_identity_for_child(
                                identities,
                                "column_groups",
                                "column_group",
                                None,
                                index,
                                column_group.identity_key.as_deref(),
                            );
                            column_group_into_entity(column_group, identities)
                        })
                        .collect(),
                ),
            }),
    }
}

fn diagram_walkers_into_entity(
    dto: dto::diagram_walkers::DiagramWalkers,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::diagram_walkers::DiagramWalkers {
    entity::diagram_walkers::DiagramWalkers {
        tables: dto.tables.map(|tables| {
            tables
                .into_iter()
                .enumerate()
                .map(|(index, table)| {
                    push_identity_for_child(
                        identities,
                        "diagram_walkers",
                        "table",
                        None,
                        index,
                        table.identity_key.as_deref(),
                    );
                    table_into_entity(table, identities)
                })
                .collect()
        }),
    }
}

fn table_into_entity(
    dto: dto::diagram_walkers::tables::Table,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::diagram_walkers::tables::Table {
    let parent_id = dto.identity_key.clone();
    entity::diagram_walkers::tables::Table {
        physical_name: dto.physical_name,
        logical_name: dto.logical_name,
        description: dto.description,
        height: dto.height,
        width: dto.width,
        font_name: dto.font_name,
        font_size: dto.font_size,
        x: dto.x,
        y: dto.y,
        color: dto.color.into(),
        connections: connections_into_entity(dto.connections, parent_id.as_deref(), identities),
        table_constraint: dto.table_constraint,
        primary_key_name: dto.primary_key_name,
        option: dto.option,
        columns: table_columns_into_entity(dto.columns, parent_id.as_deref(), identities),
        indexes: entity::diagram_walkers::tables::indexes::Indexes {
            indexes: dto.indexes.map(|indexes| {
                indexes
                    .into_iter()
                    .enumerate()
                    .map(|(index, index_dto)| {
                        push_identity_for_child(
                            identities,
                            "indexes",
                            "index",
                            parent_id.as_deref(),
                            index,
                            index_dto.identity_key.as_deref(),
                        );
                        index_dto.into()
                    })
                    .collect()
            }),
        },
        compound_unique_key_list: compound_unique_key_list_into_entity(
            dto.compound_unique_key_list,
            parent_id.as_deref(),
            identities,
        ),
        table_properties: entity::diagram_walkers::tables::TableProperties {},
    }
}

fn table_columns_into_entity(
    dto: dto::diagram_walkers::tables::columns::Columns,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::diagram_walkers::tables::columns::Columns {
    entity::diagram_walkers::tables::columns::Columns {
        items: dto.items.map(|items| {
            let mut normal_column_index = 0;
            items
                .into_iter()
                .map(|item| match item {
                    dto::diagram_walkers::tables::columns::ColumnItem::Normal(column) => {
                        push_identity_for_child(
                            identities,
                            "columns",
                            "normal_column",
                            repeated_parent_id,
                            normal_column_index,
                            column.identity_key.as_deref(),
                        );
                        normal_column_index += 1;
                        entity::diagram_walkers::tables::columns::ColumnItem::Normal(column.into())
                    }
                    dto::diagram_walkers::tables::columns::ColumnItem::Group(column_group) => {
                        entity::diagram_walkers::tables::columns::ColumnItem::Group(column_group)
                    }
                })
                .collect()
        }),
    }
}

fn connections_into_entity(
    dto: dto::diagram_walkers::tables::connections::Connections,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::diagram_walkers::tables::connections::Connections {
    entity::diagram_walkers::tables::connections::Connections {
        relationships: dto.relationships.map(|relationships| {
            relationships
                .into_iter()
                .enumerate()
                .map(|(index, relationship)| {
                    push_identity_for_child(
                        identities,
                        "connections",
                        "relationship",
                        repeated_parent_id,
                        index,
                        relationship.identity_key.as_deref(),
                    );
                    relationship.into()
                })
                .collect()
        }),
    }
}

fn compound_unique_key_list_into_entity(
    dto: dto::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList {
    entity::diagram_walkers::tables::compound_unique_key_list::CompoundUniqueKeyList {
        compound_unique_keys: dto.compound_unique_keys.map(|keys| {
            keys.into_iter()
                .enumerate()
                .map(|(index, key)| {
                    push_identity_for_child(
                        identities,
                        "compound_unique_key_list",
                        "compound_unique_key",
                        repeated_parent_id,
                        index,
                        key.identity_key.as_deref(),
                    );
                    key.into()
                })
                .collect()
        }),
    }
}

fn vdiagram_into_entity(
    dto: dto::vdiagrams::VDiagram,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::vdiagrams::Vdiagram {
    let parent_id = dto.identity_key.clone();
    entity::vdiagrams::Vdiagram {
        vdiagram_name: dto.vdiagram_name,
        color: dto.color.map(Into::into),
        vtables: entity::vdiagrams::vtables::Vtables {
            vtables: dto.vtables.map(|vtables| {
                vtables
                    .into_iter()
                    .enumerate()
                    .map(|(index, vtable)| {
                        push_identity_for_child(
                            identities,
                            "vtables",
                            "vtable",
                            parent_id.as_deref(),
                            index,
                            vtable.identity_key.as_deref(),
                        );
                        vtable.into()
                    })
                    .collect()
            }),
        },
        walker_notes: dto.walker_notes.into(),
        walker_groups: dto.walker_groups.into(),
    }
}

fn column_group_into_entity(
    dto: dto::column_groups::ColumnGroup,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::column_groups::ColumnGroup {
    let parent_id = dto.identity_key.clone();
    entity::column_groups::ColumnGroup {
        column_group_name: dto.column_group_name,
        columns: column_group_columns_into_entity(dto.columns, parent_id.as_deref(), identities),
    }
}

fn column_group_columns_into_entity(
    dto: dto::column_groups::Columns,
    repeated_parent_id: Option<&str>,
    identities: &mut Vec<XmlNodeIdentity>,
) -> entity::column_groups::Columns {
    entity::column_groups::Columns {
        normal_columns: dto.normal_columns.map(|columns| {
            columns
                .into_iter()
                .enumerate()
                .map(|(index, column)| {
                    push_identity_for_child(
                        identities,
                        "columns",
                        "normal_column",
                        repeated_parent_id,
                        index,
                        column.identity_key.as_deref(),
                    );
                    column.into()
                })
                .collect()
        }),
    }
}

// Assigns path-based identity ids to repeated elements in the preserved source
// XML tree.
fn assign_source_identities(root: &mut XmlElement) {
    assign_source_identity_children(root, &mut Vec::new());
}

// Recursively writes source XML path ids onto identity children.
fn assign_source_identity_children(element: &mut XmlElement, path: &mut Vec<usize>) {
    let mut element_index = 0;
    for child in &mut element.children {
        let XmlNode::Element(child) = child else {
            continue;
        };
        path.push(element_index);
        if is_identity_child(&element.name, &child.name) {
            child.identity_id = Some(path_id(path));
        }
        assign_source_identity_children(child, path);
        path.pop();
        element_index += 1;
    }
}

// Reconnects serialized managed elements to the source XML identities collected
// during read.
fn assign_managed_identities(root: &mut XmlElement, identities: &[XmlNodeIdentity]) {
    let mut index_lookup = HashMap::new();

    for identity in identities {
        index_lookup.insert(
            (
                identity.tag.as_str(),
                identity.parent_id.as_deref(),
                identity.index,
            ),
            identity.id.as_str(),
        );
    }

    assign_managed_identity_children(root, None, &index_lookup);
}

// Assigns DTO-held identity keys to managed identity children using their
// current tag/index position under the current repeated parent.
fn assign_managed_identity_children<'a>(
    element: &mut XmlElement,
    repeated_parent_id: Option<&'a str>,
    index_lookup: &IdentityIndexLookup<'a>,
) {
    let mut tag_indexes: HashMap<String, usize> = HashMap::new();
    for child in &mut element.children {
        let XmlNode::Element(child) = child else {
            continue;
        };
        let index = tag_indexes.entry(child.name.clone()).or_default();
        let mut next_parent_id = repeated_parent_id.map(str::to_string);
        if is_identity_child(&element.name, &child.name) {
            child.identity_id = index_lookup
                .get(&(child.name.as_str(), repeated_parent_id, *index))
                .copied()
                .map(|id| (*id).to_string());
            next_parent_id = child.identity_id.clone();
        }
        assign_managed_identity_children(child, next_parent_id.as_deref(), index_lookup);
        *index += 1;
    }
}

// Merges one preserved element with the corresponding managed element while
// keeping raw and unknown preserved children in place.
fn merge_element(mut base: XmlElement, managed: XmlElement) -> XmlElement {
    if base.end.is_none() && managed.end.is_some() {
        base.end = managed.end.clone();
    }
    if !base.children.iter().any(is_element) && !managed.children.iter().any(is_element) {
        base.children = managed.children;
        return base;
    }

    let mut managed_children: Vec<Option<XmlElement>> = managed
        .children
        .into_iter()
        .filter_map(|child| match child {
            XmlNode::Element(element) => Some(Some(element)),
            XmlNode::Raw(_) => None,
        })
        .collect();
    let mut base_identity_children = base_identity_children(&base.name, &base.children);
    let base_tag_counts = element_tag_counts(&base.children);
    let mut appended_identity_tags = HashSet::new();
    let mut seen_tags: HashMap<String, usize> = HashMap::new();
    let mut merged_children = Vec::new();

    for child in base.children {
        match child {
            XmlNode::Raw(raw) => merged_children.push(XmlNode::Raw(raw)),
            XmlNode::Element(base_child) if !is_known_child(&base.name, &base_child.name) => {
                merged_children.push(XmlNode::Element(base_child));
            }
            XmlNode::Element(base_child) => {
                let tag = base_child.name.clone();
                if is_identity_child(&base.name, &tag) {
                    if appended_identity_tags.insert(tag.clone()) {
                        append_identity_tag_in_managed_order(
                            &tag,
                            &mut base_identity_children,
                            &mut managed_children,
                            &mut merged_children,
                        );
                    }
                    continue;
                }

                *seen_tags.entry(tag.clone()).or_default() += 1;
                if let Some(index) = find_managed_match(&base_child, &managed_children) {
                    let managed_child = managed_children[index]
                        .take()
                        .expect("managed child was already consumed");
                    merged_children
                        .push(XmlNode::Element(merge_element(base_child, managed_child)));
                }

                if seen_tags.get(&tag) == base_tag_counts.get(&tag) {
                    append_unmatched_tag(&tag, &mut managed_children, &mut merged_children);
                }
            }
        }
    }

    for child in managed_children.into_iter().flatten() {
        merged_children.push(XmlNode::Element(child));
    }
    base.children = merged_children;
    base
}

// Collects preserved identity children by tag so each managed child can reuse
// the matching preserved subtree while following managed order.
fn base_identity_children(parent: &str, children: &[XmlNode]) -> HashMap<String, Vec<XmlElement>> {
    let mut identity_children: HashMap<String, Vec<XmlElement>> = HashMap::new();

    for child in children {
        let XmlNode::Element(element) = child else {
            continue;
        };
        if is_identity_child(parent, &element.name) {
            identity_children
                .entry(element.name.clone())
                .or_default()
                .push(element.clone());
        }
    }

    identity_children
}

// Emits repeated identity children in managed order and merges each item with
// its preserved counterpart when an identity match exists.
fn append_identity_tag_in_managed_order(
    tag: &str,
    base_identity_children: &mut HashMap<String, Vec<XmlElement>>,
    managed: &mut [Option<XmlElement>],
    output: &mut Vec<XmlNode>,
) {
    let mut base_children = base_identity_children
        .remove(tag)
        .unwrap_or_default()
        .into_iter()
        .map(Some)
        .collect::<Vec<_>>();

    for candidate in managed {
        if !candidate.as_ref().is_some_and(|child| child.name == tag) {
            continue;
        }

        let managed_child = candidate.take().expect("candidate disappeared");
        let base_index = managed_child.identity_id.as_ref().and_then(|identity_id| {
            base_children.iter().position(|base_child| {
                base_child
                    .as_ref()
                    .is_some_and(|base_child| base_child.identity_id.as_ref() == Some(identity_id))
            })
        });

        let child = if let Some(base_index) = base_index {
            let base_child = base_children[base_index]
                .take()
                .expect("base child was already consumed");
            merge_element(base_child, managed_child)
        } else {
            managed_child
        };
        output.push(XmlNode::Element(child));
    }
}

// Finds the managed child that should update a preserved child.
fn find_managed_match(base: &XmlElement, managed: &[Option<XmlElement>]) -> Option<usize> {
    // For repeated schema children, identity ids are safer than tag matching.
    // If managed siblings for this tag have ids but none match, the base node
    // represents a removed element and should not consume another sibling.
    if base.identity_id.is_some() {
        let identity_match = base.identity_id.as_ref().and_then(|id| {
            managed.iter().position(|candidate| {
                candidate
                    .as_ref()
                    .is_some_and(|candidate| candidate.identity_id.as_ref() == Some(id))
            })
        });
        if identity_match.is_some() {
            return identity_match;
        }
        let has_ids_for_tag = managed.iter().any(|candidate| {
            candidate.as_ref().is_some_and(|candidate| {
                candidate.name == base.name && candidate.identity_id.is_some()
            })
        });
        if has_ids_for_tag {
            return None;
        }
    }
    managed.iter().position(|candidate| {
        candidate
            .as_ref()
            .is_some_and(|candidate| candidate.name == base.name)
    })
}

// Appends managed children that did not exist in the preserved XML after the
// last preserved sibling with the same tag.
fn append_unmatched_tag(tag: &str, managed: &mut [Option<XmlElement>], output: &mut Vec<XmlNode>) {
    for candidate in managed {
        if candidate.as_ref().is_some_and(|child| child.name == tag) {
            output.push(XmlNode::Element(
                candidate.take().expect("candidate disappeared"),
            ));
        }
    }
}

// Counts preserved element children by tag so new managed siblings can be
// inserted after the final preserved sibling in each tag group.
fn element_tag_counts(children: &[XmlNode]) -> HashMap<String, usize> {
    let mut counts = HashMap::new();
    for child in children {
        if let XmlNode::Element(element) = child {
            *counts.entry(element.name.clone()).or_default() += 1;
        }
    }
    counts
}

// Parses a full XML document and returns the root element tree.
fn parse_document(xml: &str) -> Result<XmlElement, Error> {
    // Only element nodes are interpreted. Everything else before the root is
    // ignored because the writer owns the final XML declaration.
    let mut reader = Reader::from_str(xml);
    loop {
        match reader.read_event()? {
            Event::Start(start) => return parse_element(&mut reader, start.into_owned()),
            Event::Empty(start) => {
                let start = start.into_owned();
                return Ok(XmlElement {
                    name: event_name(&start),
                    start,
                    end: None,
                    children: Vec::new(),
                    identity_id: None,
                });
            }
            Event::Eof => unreachable!("XML document has no root element"),
            _ => {}
        }
    }
}

// Parses an XML element into the preservation tree, keeping child elements
// structured and all other events as raw bytes.
fn parse_element(
    reader: &mut Reader<&[u8]>,
    start: BytesStart<'static>,
) -> Result<XmlElement, Error> {
    let name = event_name(&start);
    let mut children = Vec::new();
    loop {
        match reader.read_event()? {
            Event::Start(child) => {
                children.push(XmlNode::Element(parse_element(reader, child.into_owned())?));
            }
            Event::Empty(child) => {
                let child = child.into_owned();
                children.push(XmlNode::Element(XmlElement {
                    name: event_name(&child),
                    start: child,
                    end: None,
                    children: Vec::new(),
                    identity_id: None,
                }));
            }
            Event::End(end) => {
                return Ok(XmlElement {
                    name,
                    start,
                    end: Some(end.into_owned()),
                    children,
                    identity_id: None,
                });
            }
            Event::Eof => unreachable!("XML element was not closed"),
            event => children.push(XmlNode::Raw(event_bytes(event)?)),
        }
    }
}

// Writes the preservation tree back to XML, passing raw events through
// byte-for-byte.
fn write_element(writer: &mut Writer<Vec<u8>>, element: &XmlElement) -> Result<(), Error> {
    if element.end.is_none() {
        writer.write_event(Event::Empty(element.start.borrow()))?;
        return Ok(());
    }
    writer.write_event(Event::Start(element.start.borrow()))?;
    for child in &element.children {
        match child {
            XmlNode::Element(child) => write_element(writer, child)?,
            XmlNode::Raw(raw) => writer.get_mut().extend_from_slice(raw),
        }
    }
    writer.write_event(Event::End(
        element.end.as_ref().expect("checked above").borrow(),
    ))?;
    Ok(())
}

// Serializes a non-structured quick-xml event so it can be preserved as raw
// bytes in the tree.
fn event_bytes(event: Event<'_>) -> Result<Vec<u8>, Error> {
    let mut writer = Writer::new(Vec::new());
    writer.write_event(event.borrow())?;
    Ok(writer.into_inner())
}

// Reads the UTF-8 tag name from a quick-xml start event.
fn event_name(start: &BytesStart<'_>) -> String {
    std::str::from_utf8(start.name().as_ref())
        .expect("quick-xml read invalid UTF-8 tag name")
        .to_string()
}

// Converts an element-child path to a stable dotted id for source XML nodes.
fn path_id(path: &[usize]) -> String {
    path.iter()
        .map(usize::to_string)
        .collect::<Vec<_>>()
        .join(".")
}

// Distinguishes structured XML children from raw events.
fn is_element(node: &XmlNode) -> bool {
    matches!(node, XmlNode::Element(_))
}

// Checks entity schema metadata for repeated children that require identity
// matching.
fn is_identity_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_identity_child(parent, tag)
}

// Checks entity schema metadata for children owned by ERM serialization.
fn is_known_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_known_child(parent, tag)
}
