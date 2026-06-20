use super::errors::Error;
use crate::dtos::diagram::Diagram;
use quick_xml::events::{BytesStart, Event};
use quick_xml::name::QName;
use quick_xml::se::to_string_with_root;
use quick_xml::{Reader, Writer};
use std::collections::{HashMap, HashSet};
use std::fs;

const XML_DECLARATION: &str = r#"<?xml version="1.0" encoding="UTF-8"?>"#;

const MANAGED_TAGS: [&str; 4] = [
    "diagram_settings",
    "diagram_walkers",
    "vdiagrams",
    "column_groups",
];
const MANAGED_SETTING_TAGS: [&str; 2] = ["database", "view_mode"];

pub fn write_file(filename: &str, diagram: Diagram) -> Result<(), Error> {
    let preserved_xml = diagram
        .preserved_xml
        .clone()
        .ok_or(Error::MissingPreservedXml)?;
    let entity: crate::entities::diagram::Diagram = diagram.into();
    let managed_xml = to_string_with_root("diagram", &entity)?;
    let xml = merge_managed_elements(&preserved_xml, &managed_xml)?;
    fs::write(filename, format!("{XML_DECLARATION}\n{xml}\n"))?;
    Ok(())
}

fn merge_managed_elements(base_xml: &str, managed_xml: &str) -> Result<String, Error> {
    let replacements = collect_managed_elements(managed_xml)?;
    let mut written_tags = HashSet::new();
    let mut reader = Reader::from_str(base_xml);
    let mut writer = Writer::new(Vec::new());
    let mut depth = 0;

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Decl(_) => {}
            Event::Start(event) => {
                if depth == 1 && is_managed_tag(event.name()) {
                    let name = tag_name(event.name()).to_string();
                    if name == "diagram_settings" {
                        let base_element = collect_element(&mut reader, event)?;
                        let replacement = replacements
                            .get(&name)
                            .expect("serialized diagram always has diagram_settings");
                        let merged = merge_selected_elements(
                            &base_element,
                            replacement,
                            &MANAGED_SETTING_TAGS,
                        )?;
                        writer.get_mut().extend_from_slice(&merged);
                        written_tags.insert(name);
                    } else {
                        write_replacement(
                            &mut writer,
                            &replacements,
                            &mut written_tags,
                            event.name(),
                        )?;
                        skip_element(&mut reader, event.name())?;
                    }
                } else {
                    writer.write_event(Event::Start(event.borrow()))?;
                    depth += 1;
                }
            }
            Event::Empty(event) => {
                if depth == 1 && is_managed_tag(event.name()) {
                    write_replacement(&mut writer, &replacements, &mut written_tags, event.name())?;
                } else {
                    writer.write_event(Event::Empty(event.borrow()))?;
                }
            }
            Event::End(event) => {
                if depth == 1 {
                    write_missing_replacements(&mut writer, &replacements, &mut written_tags);
                }
                writer.write_event(Event::End(event.borrow()))?;
                depth -= 1;
            }
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(String::from_utf8(writer.into_inner()).expect("quick-xml wrote invalid UTF-8"))
}

fn merge_selected_elements(
    base_xml: &[u8],
    managed_xml: &[u8],
    managed_tags: &[&str],
) -> Result<Vec<u8>, Error> {
    let replacements = collect_selected_elements(managed_xml, managed_tags)?;
    let mut written_tags = HashSet::new();
    let mut reader = Reader::from_reader(base_xml);
    let mut writer = Writer::new(Vec::new());
    let mut depth = 0;

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Start(event) => {
                if depth == 1 && managed_tags.contains(&tag_name(event.name())) {
                    write_replacement(&mut writer, &replacements, &mut written_tags, event.name())?;
                    skip_element(&mut reader, event.name())?;
                } else {
                    writer.write_event(Event::Start(event.borrow()))?;
                    depth += 1;
                }
            }
            Event::Empty(event) => {
                if depth == 1 && managed_tags.contains(&tag_name(event.name())) {
                    write_replacement(&mut writer, &replacements, &mut written_tags, event.name())?;
                } else {
                    writer.write_event(Event::Empty(event.borrow()))?;
                }
            }
            Event::End(event) => {
                if depth == 1 {
                    write_missing_elements(
                        &mut writer,
                        &replacements,
                        &mut written_tags,
                        managed_tags,
                    );
                }
                writer.write_event(Event::End(event.borrow()))?;
                depth -= 1;
            }
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(writer.into_inner())
}

fn collect_managed_elements(managed_xml: &str) -> Result<HashMap<String, Vec<u8>>, Error> {
    collect_selected_elements(managed_xml.as_bytes(), &MANAGED_TAGS)
}

fn collect_selected_elements(
    xml: &[u8],
    selected_tags: &[&str],
) -> Result<HashMap<String, Vec<u8>>, Error> {
    let mut reader = Reader::from_reader(xml);
    let mut elements = HashMap::new();
    let mut depth = 0;

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Start(event) => {
                if depth == 1 && selected_tags.contains(&tag_name(event.name())) {
                    elements.insert(
                        tag_name(event.name()).to_string(),
                        collect_element(&mut reader, event)?,
                    );
                } else {
                    depth += 1;
                }
            }
            Event::Empty(event) => {
                if depth == 1 && selected_tags.contains(&tag_name(event.name())) {
                    let mut writer = Writer::new(Vec::new());
                    writer.write_event(Event::Empty(event.borrow()))?;
                    elements.insert(tag_name(event.name()).to_string(), writer.into_inner());
                }
            }
            Event::End(_) => {
                depth -= 1;
            }
            _ => {}
        }
    }

    Ok(elements)
}

fn collect_element(reader: &mut Reader<&[u8]>, start: BytesStart) -> Result<Vec<u8>, Error> {
    let mut writer = Writer::new(Vec::new());
    let mut depth = 1;

    writer.write_event(Event::Start(start.borrow()))?;

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Start(event) => {
                writer.write_event(Event::Start(event.borrow()))?;
                depth += 1;
            }
            Event::End(event) => {
                writer.write_event(Event::End(event.borrow()))?;
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(writer.into_inner())
}

fn skip_element(reader: &mut Reader<&[u8]>, end: QName) -> Result<(), Error> {
    let mut depth = 1;

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Start(_) => depth += 1,
            Event::End(event) if event.name() == end => {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            Event::End(_) => depth -= 1,
            _ => {}
        }
    }

    Ok(())
}

fn write_replacement(
    writer: &mut Writer<Vec<u8>>,
    replacements: &HashMap<String, Vec<u8>>,
    written_tags: &mut HashSet<String>,
    name: QName,
) -> Result<(), Error> {
    let name = tag_name(name);
    if let Some(replacement) = replacements.get(name) {
        writer.get_mut().extend_from_slice(replacement);
    }
    written_tags.insert(name.to_string());

    Ok(())
}

fn write_missing_replacements(
    writer: &mut Writer<Vec<u8>>,
    replacements: &HashMap<String, Vec<u8>>,
    written_tags: &mut HashSet<String>,
) {
    write_missing_elements(writer, replacements, written_tags, &MANAGED_TAGS);
}

fn write_missing_elements(
    writer: &mut Writer<Vec<u8>>,
    replacements: &HashMap<String, Vec<u8>>,
    written_tags: &mut HashSet<String>,
    tag_names: &[&str],
) {
    for tag_name in tag_names {
        if written_tags.contains(*tag_name) {
            continue;
        }
        if let Some(replacement) = replacements.get(*tag_name) {
            writer.get_mut().extend_from_slice(replacement);
        }
        written_tags.insert((*tag_name).to_string());
    }
}

fn is_managed_tag(name: QName) -> bool {
    MANAGED_TAGS.contains(&tag_name(name))
}

fn tag_name<'a>(name: QName<'a>) -> &'a str {
    std::str::from_utf8(name.into_inner()).expect("quick-xml read invalid UTF-8 tag name")
}
