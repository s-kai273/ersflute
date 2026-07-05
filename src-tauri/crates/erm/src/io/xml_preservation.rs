use crate::dtos::diagram::XmlNodeIdentity;
use crate::entities::XmlSchema as _;
use crate::errors::Error;
use quick_xml::events::{BytesEnd, BytesStart, Event};
use quick_xml::{Reader, Writer};
use std::collections::HashMap;

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

// Captures stable identities from source XML before DTO edits change ordering
// or names of repeated elements.
pub(crate) fn collect_xml_node_identities(xml: &str) -> Result<Vec<XmlNodeIdentity>, Error> {
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
    let lookup: HashMap<(&str, Option<&str>, usize), &str> = identities
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
        .collect();
    assign_managed_identity_children(root, None, &lookup);
}

// Assigns source identity ids to managed identity children using their
// tag/index position under the current repeated parent.
fn assign_managed_identity_children<'a>(
    element: &mut XmlElement,
    repeated_parent_id: Option<&'a str>,
    lookup: &HashMap<(&'a str, Option<&'a str>, usize), &'a str>,
) {
    let mut tag_indexes: HashMap<String, usize> = HashMap::new();
    for child in &mut element.children {
        let XmlNode::Element(child) = child else {
            continue;
        };
        let index = tag_indexes.entry(child.name.clone()).or_default();
        let mut next_parent_id = repeated_parent_id.map(str::to_string);
        if is_identity_child(&element.name, &child.name) {
            child.identity_id = lookup
                .get(&(child.name.as_str(), repeated_parent_id, *index))
                .map(|id| (*id).to_string());
            next_parent_id = child.identity_id.clone();
        }
        assign_managed_identity_children(child, next_parent_id.as_deref(), lookup);
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
    let base_tag_counts = element_tag_counts(&base.children);
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
