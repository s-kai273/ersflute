use erm::dtos::diagram::diagram_walkers;
use erm::dtos::diagram::diagram_walkers::tables;
use erm::dtos::diagram::vdiagrams;

use crate::write::support;

#[test]
fn vdiagrams_tags_are_serialized() {
    let mut diagram = support::minimal_diagram();
    diagram.diagram_walkers = Some(diagram_walkers::DiagramWalkers {
        identity_key: None,
        tables: Some(vec![
            table("MEMBERS", 160, 106),
            table("MEMBER_STATUS", 400, 120),
        ]),
    });
    diagram.vdiagrams = Some(vec![
        vdiagrams::VDiagram {
            identity_key: None,
            vdiagram_name: "main".to_string(),
            color: Some(vdiagrams::Color {
                identity_key: None,
                r: 64,
                g: 128,
                b: 192,
            }),
            vtables: Some(vec![
                vdiagrams::vtables::VTable {
                    identity_key: None,
                    table_id: "table.MEMBERS".to_string(),
                    x: 160,
                    y: 106,
                    font_name: "Ubuntu".to_string(),
                    font_size: 9,
                },
                vdiagrams::vtables::VTable {
                    identity_key: None,
                    table_id: "table.MEMBER_STATUS".to_string(),
                    x: 400,
                    y: 120,
                    font_name: "Ubuntu".to_string(),
                    font_size: 10,
                },
            ]),
            walker_notes: vdiagrams::WalkerNotes { identity_key: None },
            walker_groups: vdiagrams::WalkerGroups { identity_key: None },
        },
        vdiagrams::VDiagram {
            identity_key: None,
            vdiagram_name: "empty".to_string(),
            color: None,
            vtables: None,
            walker_notes: vdiagrams::WalkerNotes { identity_key: None },
            walker_groups: vdiagrams::WalkerGroups { identity_key: None },
        },
    ]);

    support::assert_serialized_element(
        diagram,
        "vdiagrams",
        "vdiagrams",
        include_str!("../../fixtures/diagram/vdiagrams.erm"),
    );
}

fn table(physical_name: &str, x: u16, y: u16) -> tables::Table {
    tables::Table {
        identity_key: None,
        physical_name: physical_name.to_string(),
        logical_name: physical_name.to_string(),
        description: "".to_string(),
        height: None,
        width: None,
        font_name: "Ubuntu".to_string(),
        font_size: 9,
        x,
        y,
        color: tables::Color {
            identity_key: None,
            r: 128,
            g: 128,
            b: 192,
        },
        connections: tables::connections::Connections {
            identity_key: None,
            relationships: None,
        },
        table_constraint: None,
        primary_key_name: None,
        option: None,
        columns: tables::columns::Columns {
            identity_key: None,
            items: None,
        },
        indexes: None,
        compound_unique_key_list: tables::compound_unique_key_list::CompoundUniqueKeyList {
            identity_key: None,
            compound_unique_keys: None,
        },
    }
}
