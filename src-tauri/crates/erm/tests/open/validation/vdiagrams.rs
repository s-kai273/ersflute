use crate::open::support;
use crate::open::validation::support::assert_validation_error_with_targets;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const TEMP_PREFIX: &str = "erm_vdiagrams_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_virtual_diagram_name_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "</diagram>",
        &format!("{VDIAGRAMS_WITH_DUPLICATE_NAME}\n</diagram>"),
        "duplicate_virtual_diagram_name",
    );

    assert_validation_error_with_targets(
        result,
        "vdiagrams.vdiagram[1].vdiagram_name",
        "duplicate virtual diagram name: main",
        &[("virtual diagram name", "main")],
    );
}

#[test]
fn virtual_table_id_without_table_prefix_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "</diagram>",
        &format!("{VDIAGRAM_WITH_INVALID_TABLE_ID}\n</diagram>"),
        "virtual_table_id_without_table_prefix",
    );

    assert_validation_error_with_targets(
        result,
        "vdiagrams.vdiagram[0].vtables.vtable[0].table_id",
        "invalid virtual table table_id: MEMBERS",
        &[("virtual diagram name", "main"), ("table id", "MEMBERS")],
    );
}

#[test]
fn virtual_table_id_with_unknown_table_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "</diagram>",
        &format!("{VDIAGRAM_WITH_UNKNOWN_TABLE_ID}\n</diagram>"),
        "virtual_table_id_with_unknown_table",
    );

    assert_validation_error_with_targets(
        result,
        "vdiagrams.vdiagram[0].vtables.vtable[0].table_id",
        "unknown virtual table table_id: table.UNKNOWN_MEMBERS",
        &[
            ("virtual diagram name", "main"),
            ("table id", "table.UNKNOWN_MEMBERS"),
        ],
    );
}

#[test]
fn duplicate_virtual_table_id_in_same_virtual_diagram_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "</diagram>",
        &format!("{VDIAGRAM_WITH_DUPLICATE_TABLE}\n</diagram>"),
        "duplicate_virtual_table_id_in_same_virtual_diagram",
    );

    assert_validation_error_with_targets(
        result,
        "vdiagrams.vdiagram[0].vtables.vtable[1].table_id",
        "duplicate virtual table table_id: table.MEMBERS",
        &[
            ("virtual diagram name", "main"),
            ("table id", "table.MEMBERS"),
        ],
    );
}

#[test]
fn same_virtual_table_id_in_different_virtual_diagrams_is_accepted() {
    ASSERTIONS.assert_replaced_fixture_parse_success(
        "</diagram>",
        &format!("{VDIAGRAMS_WITH_SHARED_TABLE}\n</diagram>"),
        "same_virtual_table_id_in_different_virtual_diagrams",
    );
}

const VDIAGRAM_WITH_INVALID_TABLE_ID: &str = r#"  <vdiagrams>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>MEMBERS</table_id>
          <x>160</x>
          <y>106</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
  </vdiagrams>"#;

const VDIAGRAM_WITH_UNKNOWN_TABLE_ID: &str = r#"  <vdiagrams>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.UNKNOWN_MEMBERS</table_id>
          <x>160</x>
          <y>106</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
  </vdiagrams>"#;

const VDIAGRAMS_WITH_DUPLICATE_NAME: &str = r#"  <vdiagrams>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.MEMBERS</table_id>
          <x>160</x>
          <y>106</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.MEMBER_STATUS</table_id>
          <x>400</x>
          <y>120</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
  </vdiagrams>"#;

const VDIAGRAM_WITH_DUPLICATE_TABLE: &str = r#"  <vdiagrams>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.MEMBERS</table_id>
          <x>160</x>
          <y>106</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
        <vtable>
          <table_id>table.MEMBERS</table_id>
          <x>400</x>
          <y>120</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
  </vdiagrams>"#;

const VDIAGRAMS_WITH_SHARED_TABLE: &str = r#"  <vdiagrams>
    <vdiagram>
      <vdiagram_name>main</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.MEMBERS</table_id>
          <x>160</x>
          <y>106</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
    <vdiagram>
      <vdiagram_name>detail</vdiagram_name>
      <vtables>
        <vtable>
          <table_id>table.MEMBERS</table_id>
          <x>400</x>
          <y>120</y>
          <font_name>Ubuntu</font_name>
          <font_size>9</font_size>
        </vtable>
      </vtables>
      <walker_notes />
      <walker_groups />
    </vdiagram>
  </vdiagrams>"#;
