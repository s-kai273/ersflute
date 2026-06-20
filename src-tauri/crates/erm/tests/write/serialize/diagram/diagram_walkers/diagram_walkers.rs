use crate::write::support as write_support;

use super::support;

#[test]
fn diagram_walkers_details_are_serialized() {
    let content =
        write_support::save_diagram_to_string(support::diagram(), "diagram_walkers_details");

    assert_eq!(
        write_support::extract_element(&content, "diagram_walkers"),
        write_support::extract_element(support::DETAILS_FIXTURE, "diagram_walkers")
    );
}
