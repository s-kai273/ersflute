use crate::dtos::diagram::XmlNodeIdentity;
use crate::entities::XmlSchema as _;
use crate::errors::Error;
use quick_xml::events::{BytesEnd, BytesStart, Event};
use quick_xml::{Reader, Writer};
use std::collections::HashMap;

#[derive(Clone)]
enum XmlNode {
    Element(XmlElement),
    Raw(Vec<u8>),
}

#[derive(Clone)]
struct XmlElement {
    name: String,
    start: BytesStart<'static>,
    end: Option<BytesEnd<'static>>,
    children: Vec<XmlNode>,
    identity_id: Option<String>,
}

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

pub(crate) fn collect_xml_node_identities(xml: &str) -> Result<Vec<XmlNodeIdentity>, Error> {
    let root = parse_document(xml)?;
    let mut identities = Vec::new();
    collect_identities(&root, None, &mut Vec::new(), &mut identities);
    Ok(identities)
}

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

fn assign_source_identities(root: &mut XmlElement) {
    assign_source_identity_children(root, &mut Vec::new());
}

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

fn find_managed_match(base: &XmlElement, managed: &[Option<XmlElement>]) -> Option<usize> {
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

fn append_unmatched_tag(tag: &str, managed: &mut [Option<XmlElement>], output: &mut Vec<XmlNode>) {
    for candidate in managed {
        if candidate.as_ref().is_some_and(|child| child.name == tag) {
            output.push(XmlNode::Element(
                candidate.take().expect("candidate disappeared"),
            ));
        }
    }
}

fn element_tag_counts(children: &[XmlNode]) -> HashMap<String, usize> {
    let mut counts = HashMap::new();
    for child in children {
        if let XmlNode::Element(element) = child {
            *counts.entry(element.name.clone()).or_default() += 1;
        }
    }
    counts
}

fn parse_document(xml: &str) -> Result<XmlElement, Error> {
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

fn event_bytes(event: Event<'_>) -> Result<Vec<u8>, Error> {
    let mut writer = Writer::new(Vec::new());
    writer.write_event(event.borrow())?;
    Ok(writer.into_inner())
}

fn event_name(start: &BytesStart<'_>) -> String {
    std::str::from_utf8(start.name().as_ref())
        .expect("quick-xml read invalid UTF-8 tag name")
        .to_string()
}

fn path_id(path: &[usize]) -> String {
    path.iter()
        .map(usize::to_string)
        .collect::<Vec<_>>()
        .join(".")
}

fn is_element(node: &XmlNode) -> bool {
    matches!(node, XmlNode::Element(_))
}

fn is_identity_child(parent: &str, tag: &str) -> bool {
    matches!(
        (parent, tag),
        ("diagram_walkers", "table")
            | ("columns", "normal_column")
            | ("connections", "relationship")
            | ("indexes", "index")
            | ("compound_unique_key_list", "compound_unique_key")
            | ("column_groups", "column_group")
            | ("vdiagrams", "vdiagram")
            | ("vtables", "vtable")
    )
}

fn is_known_child(parent: &str, tag: &str) -> bool {
    crate::entities::diagram::Diagram::is_known_child(parent, tag)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn repeated_elements_are_matched_by_id_after_names_change() {
        let source = concat!(
            "<diagram><diagram_walkers>",
            "<table><before>first</before><physical_name>FIRST</physical_name></table>",
            "<table><before>second</before><physical_name>SECOND</physical_name></table>",
            "</diagram_walkers></diagram>",
        );
        let managed = concat!(
            "<diagram><diagram_walkers>",
            "<table><physical_name>RENAMED_FIRST</physical_name></table>",
            "<table><physical_name>RENAMED_SECOND</physical_name></table>",
            "</diagram_walkers></diagram>",
        );

        let merged = merge_for_test(source, managed);

        assert_eq!(
            merged,
            concat!(
                "<diagram><diagram_walkers>",
                "<table><before>first</before><physical_name>RENAMED_FIRST</physical_name></table>",
                "<table><before>second</before><physical_name>RENAMED_SECOND</physical_name></table>",
                "</diagram_walkers></diagram>",
            )
        );
    }

    #[test]
    fn unknown_nested_elements_attributes_and_comments_keep_their_positions() {
        let source = concat!(
            "<diagram><diagram_walkers><table custom=\"kept\">",
            "<physical_name>OLD</physical_name><!-- marker -->",
            "<extension enabled=\"true\"><nested>value</nested></extension>",
            "<logical_name>Old label</logical_name>",
            "</table></diagram_walkers></diagram>",
        );
        let managed = concat!(
            "<diagram><diagram_walkers><table>",
            "<physical_name>NEW</physical_name><logical_name>New label</logical_name>",
            "</table></diagram_walkers></diagram>",
        );

        let merged = merge_for_test(source, managed);

        assert_eq!(
            merged,
            concat!(
                "<diagram><diagram_walkers><table custom=\"kept\">",
                "<physical_name>NEW</physical_name><!-- marker -->",
                "<extension enabled=\"true\"><nested>value</nested></extension>",
                "<logical_name>New label</logical_name>",
                "</table></diagram_walkers></diagram>",
            )
        );
    }

    #[test]
    fn empty_elements_can_be_updated_with_text() {
        let source = "<diagram><diagram_settings><database/></diagram_settings></diagram>";
        let managed = "<diagram><diagram_settings><database>PostgreSQL</database></diagram_settings></diagram>";

        let merged = merge_for_test(source, managed);

        assert_eq!(
            merged,
            "<diagram><diagram_settings><database>PostgreSQL</database></diagram_settings></diagram>"
        );
    }

    #[test]
    fn entity_defined_children_are_matched_instead_of_duplicated() {
        let source = concat!(
            "<diagram><diagram_walkers><table>",
            "<table_properties/>",
            "<physical_name>OLD</physical_name>",
            "</table></diagram_walkers></diagram>",
        );
        let managed = concat!(
            "<diagram><diagram_walkers><table>",
            "<physical_name>NEW</physical_name>",
            "<table_properties/>",
            "</table></diagram_walkers></diagram>",
        );

        let merged = merge_for_test(source, managed);

        assert_eq!(
            merged,
            concat!(
                "<diagram><diagram_walkers><table>",
                "<table_properties/>",
                "<physical_name>NEW</physical_name>",
                "</table></diagram_walkers></diagram>",
            )
        );
    }

    fn merge_for_test(source: &str, managed: &str) -> String {
        let identities = collect_xml_node_identities(source).expect("failed to collect IDs");
        merge_preserved_xml(source, managed, &identities).expect("failed to merge XML")
    }
}
