use crate::entities::diagram::Diagram;
use crate::entities::{XmlSchema as _, XmlSchemaContext};
use crate::errors::Error;
use quick_xml::events::{BytesText, Event};
use quick_xml::{Reader, Writer};

struct ElementContext {
    schema: Option<XmlSchemaContext>,
    has_child: bool,
    has_text: bool,
    // Holds owned whitespace until it can be classified. A later child makes
    // it structural indentation; closing a leaf makes it a managed value.
    pending_whitespace: Vec<BytesText<'static>>,
}

// Normalizes the final XML body with tab indentation before writing an ERM file.
pub(crate) fn format_xml(xml: &str) -> Result<String, Error> {
    let mut reader = Reader::from_str(xml);
    let mut writer = Writer::new_with_indent(Vec::new(), b'\t', 1);
    let mut elements: Vec<ElementContext> = Vec::new();

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Start(start) => {
                let name = event_name(start.name().as_ref());
                let schema = elements.last().map_or_else(
                    || (name == Diagram::XML_TAG).then(Diagram::xml_schema),
                    |parent| parent.schema.and_then(|schema| schema.child(&name)),
                );
                if let Some(parent) = elements.last_mut() {
                    parent.has_child = true;
                    parent.pending_whitespace.clear();
                }

                writer.write_event(Event::Start(start.borrow()))?;
                elements.push(ElementContext {
                    schema,
                    has_child: false,
                    has_text: false,
                    pending_whitespace: Vec::new(),
                });
            }
            Event::End(end) => {
                let element = elements.pop().expect("end event without a start event");
                if !element.has_child {
                    if element.pending_whitespace.is_empty() && !element.has_text {
                        writer.write_event(Event::Text(BytesText::new("")))?;
                    } else {
                        for text in element.pending_whitespace {
                            if element.schema.is_some_and(XmlSchemaContext::is_leaf) {
                                writer.write_event(Event::Text(encode_managed_newlines(&text)))?;
                            } else {
                                writer.write_event(Event::Text(text))?;
                            }
                        }
                    }
                }
                writer.write_event(Event::End(end.borrow()))?;
            }
            Event::Empty(empty) => {
                if let Some(parent) = elements.last_mut() {
                    parent.has_child = true;
                    parent.pending_whitespace.clear();
                }
                writer.write_event(Event::Empty(empty.borrow()))?;
            }
            Event::Text(text)
                if elements
                    .last()
                    .is_none_or(|element| element.schema.is_some())
                    && is_whitespace_text(&text) =>
            {
                if let Some(element) = elements.last_mut() {
                    element.pending_whitespace.push(text.into_owned());
                }
            }
            Event::Text(text) => {
                if let Some(element) = elements.last_mut() {
                    element.has_text = true;

                    if element.schema.is_none() {
                        writer.write_event(Event::Text(text.borrow()))?;
                        continue;
                    }

                    let is_leaf = element.schema.is_some_and(XmlSchemaContext::is_leaf);
                    for whitespace in element.pending_whitespace.drain(..) {
                        if is_leaf {
                            writer
                                .write_event(Event::Text(encode_managed_newlines(&whitespace)))?;
                        } else {
                            writer.write_event(Event::Text(whitespace))?;
                        }
                    }
                    if is_leaf {
                        writer.write_event(Event::Text(encode_managed_newlines(&text)))?;
                    } else {
                        writer.write_event(Event::Text(text.borrow()))?;
                    }
                } else {
                    writer.write_event(Event::Text(text.borrow()))?;
                }
            }
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(String::from_utf8(writer.into_inner()).expect("quick-xml wrote invalid UTF-8"))
}

// Detects indentation-only text that should be replaced by formatter output.
fn is_whitespace_text(text: &BytesText<'_>) -> bool {
    text.as_ref().iter().all(u8::is_ascii_whitespace)
}

// Preserve each newline character in managed leaf values as an explicit XML
// character reference instead of normalizing different newline sequences.
fn encode_managed_newlines(text: &BytesText<'_>) -> BytesText<'static> {
    const CARRIAGE_RETURN_REFERENCE: &str = "&#x0D;";
    const LINE_FEED_REFERENCE: &str = "&#x0A;";

    let escaped = std::str::from_utf8(text.as_ref()).expect("quick-xml read invalid UTF-8 text");
    let encoded = escaped
        .replace('\r', CARRIAGE_RETURN_REFERENCE)
        .replace('\n', LINE_FEED_REFERENCE);

    BytesText::from_escaped(encoded)
}

fn event_name(name: &[u8]) -> String {
    std::str::from_utf8(name)
        .expect("quick-xml read invalid UTF-8 tag name")
        .to_string()
}
