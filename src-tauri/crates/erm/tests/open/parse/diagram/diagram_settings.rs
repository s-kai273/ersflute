use pretty_assertions::assert_eq;

use erm::dtos::diagram::diagram_settings;
use erm::open;

use crate::open::support;

const DIAGRAM_SETTINGS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_settings.erm";
const TEMP_PREFIX: &str = "erm_diagram_settings";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_SETTINGS_FIXTURE, TEMP_PREFIX, "    ");

#[test]
fn only_used_diagram_settings_are_exposed() {
    let diagram = open(DIAGRAM_SETTINGS_FIXTURE).expect("failed to parse");

    assert_eq!(
        diagram.diagram_settings,
        diagram_settings::DiagramSettings {
            database: "MySQL".to_string(),
            view_mode: 1,
        }
    );
}

#[test]
fn view_mode_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<view_mode>1</view_mode>",
        "<view_mode>list</view_mode>",
        "view_mode",
    );
}

#[test]
fn missing_database_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("database", "missing_database");
}

#[test]
fn missing_view_mode_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("view_mode", "missing_view_mode");
}
