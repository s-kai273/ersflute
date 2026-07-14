use pretty_assertions::assert_eq;

use erm::dtos::diagram::vdiagrams;
use erm::open;

use crate::open::support;

const VDIAGRAMS_FIXTURE: &str = "./tests/open/fixtures/diagram/vdiagrams.erm";
const TEMP_PREFIX: &str = "erm_vdiagrams";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(VDIAGRAMS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn vdiagrams_tags_keep_valid_values() {
    let mut diagram = open(VDIAGRAMS_FIXTURE).expect("failed to parse");
    let opened_vdiagrams = diagram.vdiagrams.as_ref().expect("missing vdiagrams");
    assert!(
        opened_vdiagrams
            .iter()
            .all(|vdiagram| vdiagram.identity_key.is_some())
    );
    assert!(opened_vdiagrams.iter().all(|vdiagram| {
        vdiagram
            .vtables
            .iter()
            .flatten()
            .all(|vtable| vtable.identity_key.is_some())
    }));
    support::clear_identity_keys(&mut diagram);

    assert_eq!(
        diagram.vdiagrams,
        Some(vec![
            vdiagrams::Vdiagram {
                vdiagram_name: "main".to_string(),
                color: Some(vdiagrams::Color {
                    r: 64,
                    g: 128,
                    b: 192,
                }),
                vtables: Some(vec![
                    vdiagrams::vtables::Vtable {
                        table_id: "table.MEMBERS".to_string(),
                        x: 160,
                        y: 106,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                    }
                    .into(),
                    vdiagrams::vtables::Vtable {
                        table_id: "table.MEMBER_STATUS".to_string(),
                        x: 400,
                        y: 120,
                        font_name: "Ubuntu".to_string(),
                        font_size: 10,
                    }
                    .into(),
                ]),
                walker_notes: vdiagrams::WalkerNotes {},
                walker_groups: vdiagrams::WalkerGroups {},
            }
            .into(),
            vdiagrams::Vdiagram {
                vdiagram_name: "empty".to_string(),
                color: None,
                vtables: None,
                walker_notes: vdiagrams::WalkerNotes {},
                walker_groups: vdiagrams::WalkerGroups {},
            }
            .into(),
        ])
    );
}

#[test]
fn color_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "      <color>\n        <r>64</r>\n        <g>128</g>\n        <b>192</b>\n      </color>",
        "      <color>\n        <r>red</r>\n        <g>128</g>\n        <b>192</b>\n      </color>",
        "color",
    );
}

#[test]
fn x_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error("<x>160</x>", "<x>left</x>", "x");
}

#[test]
fn y_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error("<y>106</y>", "<y>top</y>", "y");
}

#[test]
fn font_size_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<font_size>9</font_size>",
        "<font_size>large</font_size>",
        "font_size",
    );
}

#[test]
fn missing_vdiagram_name_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("vdiagram_name", "missing_vdiagram_name");
}

#[test]
fn missing_walker_notes_is_rejected() {
    ASSERTIONS.assert_removed_element_parse_error("walker_notes", "missing_walker_notes");
}

#[test]
fn missing_walker_groups_is_rejected() {
    ASSERTIONS.assert_removed_element_parse_error("walker_groups", "missing_walker_groups");
}

#[test]
fn missing_table_id_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("table_id", "missing_table_id");
}

#[test]
fn missing_x_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("x", "missing_x");
}

#[test]
fn missing_y_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("y", "missing_y");
}

#[test]
fn missing_font_name_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("font_name", "missing_font_name");
}

#[test]
fn missing_font_size_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("font_size", "missing_font_size");
}
