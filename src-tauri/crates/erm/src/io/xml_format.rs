use crate::entities::XmlSchema as _;
use crate::entities::diagram::Diagram;
use crate::errors::Error;
use quick_xml::events::{BytesText, Event};
use quick_xml::{Reader, Writer};

struct ElementContext {
    name: String,
    is_known: bool,
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
                let is_known = elements.last().map_or(name == Diagram::XML_TAG, |parent| {
                    parent.is_known && Diagram::is_known_child(&parent.name, &name)
                });

                writer.write_event(Event::Start(start.borrow()))?;
                elements.push(ElementContext { name, is_known });
            }
            Event::End(end) => {
                writer.write_event(Event::End(end.borrow()))?;
                elements.pop();
            }
            Event::Text(text)
                if elements.last().is_none_or(|element| element.is_known)
                    && is_whitespace_text(&text) => {}
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(String::from_utf8(writer.into_inner()).expect("quick-xml wrote invalid UTF-8"))
}

// Detects indentation-only text that should be replaced by formatter output.
fn is_whitespace_text(text: &BytesText<'_>) -> bool {
    text.as_ref().iter().all(u8::is_ascii_whitespace)
}

fn event_name(name: &[u8]) -> String {
    std::str::from_utf8(name)
        .expect("quick-xml read invalid UTF-8 tag name")
        .to_string()
}
