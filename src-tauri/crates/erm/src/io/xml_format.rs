use crate::errors::Error;
use quick_xml::events::{BytesText, Event};
use quick_xml::{Reader, Writer};

// Normalizes the final XML body with tab indentation before writing an ERM file.
pub(crate) fn format_xml(xml: &str) -> Result<String, Error> {
    let mut reader = Reader::from_str(xml);
    let mut writer = Writer::new_with_indent(Vec::new(), b'\t', 1);

    loop {
        match reader.read_event()? {
            Event::Eof => break,
            Event::Text(text) if is_whitespace_text(&text) => {}
            event => writer.write_event(event.borrow())?,
        }
    }

    Ok(String::from_utf8(writer.into_inner()).expect("quick-xml wrote invalid UTF-8"))
}

// Detects indentation-only text that should be replaced by formatter output.
fn is_whitespace_text(text: &BytesText<'_>) -> bool {
    text.as_ref().iter().all(u8::is_ascii_whitespace)
}
