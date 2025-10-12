use erm::entities::{Color, Diagram, DiagramSettings, DiagramWalkers, Table};
use erm::open;

#[test]
fn test_read_erm_file() {
    let result = open("./tests/fixtures/testerd.erm");
    assert!(result.is_ok());
    assert_eq!(
        result.unwrap(),
        Diagram {
            diagram_settings: DiagramSettings {
                database: "MySQL".to_string()
            },
            diagram_walkers: DiagramWalkers {
                table: vec![
                    Table {
                        physical_name: "MEMBERS".to_string(),
                        logical_name: "会員".to_string(),
                        description: "".to_string(),
                        height: 108,
                        width: 194,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 160,
                        y: 106,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                    },
                    Table {
                        physical_name: "MEMBER_PROFILES".to_string(),
                        logical_name: "会員プロフィール".to_string(),
                        description: "".to_string(),
                        height: 89,
                        width: 245,
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 488,
                        y: 113,
                        color: Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                    }
                ]
            }
        }
    )
}
