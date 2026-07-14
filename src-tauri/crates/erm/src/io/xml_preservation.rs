use super::xml_identity::{attach_identity_keys, collect_identity_keys};
use crate::dtos::diagram::Diagram;
use crate::entities::XmlSchema as _;
use crate::errors::Error;
use quick_xml::errors::IllFormedError;
use quick_xml::events::{BytesEnd, BytesStart, Event};
use quick_xml::{Reader, Writer};
use std::collections::HashMap;

type IdentityIndexLookup<'a> = HashMap<(&'a str, Option<&'a str>, usize), &'a str>;

#[derive(Clone)]
pub(crate) struct XmlNodeIdentity {
    pub(crate) id: String,
    pub(crate) tag: String,
    pub(crate) parent_id: Option<String>,
    pub(crate) index: usize,
}

// This module applies managed DTO changes to the original XML without
// normalizing the whole file. It keeps unsupported content and uses schema
// metadata plus saved identities to match repeated elements.
#[derive(Clone)]
enum XmlNode {
    // Schema-aware XML element that can be merged with managed output.
    Element(XmlElement),
    // Byte-preserved non-element content such as whitespace or text.
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
    let mut diagram = Diagram::from(entity);
    attach_identity_keys(&mut diagram, &identities);
    diagram.preserved_xml = Some(xml);
    Ok(diagram)
}

// Converts a DTO into an entity while collecting identity keys in the DTO's
// current order. The merge step uses these keys to match reordered managed XML
// elements with their preserved source counterparts.
pub(crate) fn diagram_into_entity_with_identity_keys(
    diagram: Diagram,
) -> (crate::entities::diagram::Diagram, Vec<XmlNodeIdentity>) {
    let identities = collect_identity_keys(&diagram);
    let entity = diagram.into();
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
    let follows_managed_order = base.children.iter().chain(&managed.children).any(|child| {
        matches!(
            child,
            XmlNode::Element(element) if is_repeated_child(&base.name, &element.name)
        )
    });
    if !follows_managed_order {
        base.children =
            merge_children_in_preserved_order(&base.name, base.children, managed.children);
        return base;
    }

    let mut base_known_children = Vec::new();
    let preserved_layout = base
        .children
        .into_iter()
        .map(|child| match child {
            XmlNode::Element(element) if is_known_child(&base.name, &element.name) => {
                base_known_children.push(Some(element));
                None
            }
            child => Some(child),
        })
        .collect::<Vec<_>>();

    let mut managed_children = managed
        .children
        .into_iter()
        .filter_map(|child| match child {
            XmlNode::Element(element) => Some(element),
            XmlNode::Raw(_) => None,
        });
    let mut merged_managed_children = Vec::new();

    for managed_child in &mut managed_children {
        let base_index = find_base_match(&base.name, &managed_child, &base_known_children);
        let merged_child = if let Some(base_index) = base_index {
            let base_child = base_known_children[base_index]
                .take()
                .expect("base child was already consumed");
            merge_element(base_child, managed_child)
        } else {
            managed_child
        };
        merged_managed_children.push(merged_child);
    }

    let mut merged_managed_children = merged_managed_children.into_iter();
    let mut merged_children = Vec::new();
    for preserved_child in preserved_layout {
        if let Some(preserved_child) = preserved_child {
            merged_children.push(preserved_child);
        } else if let Some(managed_child) = merged_managed_children.next() {
            merged_children.push(XmlNode::Element(managed_child));
        }
    }
    merged_children.extend(merged_managed_children.map(XmlNode::Element));

    base.children = merged_children;
    base
}

// Merges fixed schema fields without moving preserved fields around unknown content.
fn merge_children_in_preserved_order(
    parent: &str,
    base: Vec<XmlNode>,
    managed: Vec<XmlNode>,
) -> Vec<XmlNode> {
    let mut managed = managed
        .into_iter()
        .filter_map(|child| match child {
            XmlNode::Element(element) => Some(Some(element)),
            XmlNode::Raw(_) => None,
        })
        .collect::<Vec<_>>();
    let mut merged = Vec::new();

    for child in base {
        let XmlNode::Element(base_child) = child else {
            merged.push(child);
            continue;
        };
        if !is_known_child(parent, &base_child.name) {
            merged.push(XmlNode::Element(base_child));
            continue;
        }
        if let Some(index) = managed.iter().position(|candidate| {
            candidate
                .as_ref()
                .is_some_and(|candidate| candidate.name == base_child.name)
        }) {
            let managed_child = managed[index]
                .take()
                .expect("managed child was already consumed");
            merged.push(XmlNode::Element(merge_element(base_child, managed_child)));
        }
    }
    merged.extend(managed.into_iter().flatten().map(XmlNode::Element));
    merged
}

// Finds the preserved child that should be merged into a managed child.
fn find_base_match(
    parent: &str,
    managed: &XmlElement,
    base: &[Option<XmlElement>],
) -> Option<usize> {
    if let Some(identity_id) = &managed.identity_id {
        return base.iter().position(|candidate| {
            candidate.as_ref().is_some_and(|candidate| {
                candidate.name == managed.name
                    && candidate.identity_id.as_ref() == Some(identity_id)
            })
        });
    }
    if is_repeated_child(parent, &managed.name) {
        return None;
    }
    base.iter().position(|candidate| {
        candidate
            .as_ref()
            .is_some_and(|candidate| candidate.name == managed.name)
    })
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
// structured and non-comment content as raw bytes.
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
            Event::Comment(_) => {}
            Event::Eof => {
                return Err(Error::Xml(
                    IllFormedError::MissingEndTag(name.clone()).into(),
                ));
            }
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

// Checks entity schema metadata for children serialized from a list.
fn is_repeated_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_repeated_child(parent, tag)
}

// Checks entity schema metadata for children owned by ERM serialization.
fn is_known_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_known_child(parent, tag)
}
