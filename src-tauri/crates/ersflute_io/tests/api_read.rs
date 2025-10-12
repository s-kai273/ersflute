use ersflute_io::{Diagram, DiagramSettings, open};

#[test]
fn test_read_erm_file() {
    let result = open("./tests/fixtures/testerd.erm");
    assert!(result.is_ok());
    assert_eq!(
        result.unwrap(),
        Diagram {
            diagram_settings: DiagramSettings {
                database: "MySQL".to_string()
            }
        }
    )
}
