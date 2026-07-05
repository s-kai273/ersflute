use std::fs;

use pretty_assertions::assert_eq;

use erm::dtos::diagram;
use erm::dtos::diagram::Diagram;
use erm::dtos::diagram::diagram_settings;
use erm::save;

pub(crate) fn save_diagram_to_string(diagram: Diagram, test_name: &str) -> String {
    let path = temp_file_path(test_name);

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let content = fs::read_to_string(&path).expect("failed to read written file");
    fs::remove_file(&path).expect("failed to remove temp file");

    content
}

pub(crate) fn assert_serialized_element(
    diagram: Diagram,
    test_name: &str,
    tag_name: &str,
    expected: &str,
) {
    let content = save_diagram_to_string(diagram, test_name);

    assert_eq!(
        compact_xml(&extract_element(&content, tag_name)),
        compact_xml(&extract_element(expected, tag_name))
    );
}

pub(crate) fn extract_element(content: &str, tag_name: &str) -> String {
    let start = content
        .find(&format!("<{tag_name}>"))
        .or_else(|| content.find(&format!("<{tag_name}/>")))
        .expect("failed to find element start");

    if content[start..].starts_with(&format!("<{tag_name}/>")) {
        return format!("<{tag_name}/>");
    }

    let end_tag = format!("</{tag_name}>");
    let end = content[start..]
        .find(&end_tag)
        .map(|index| start + index + end_tag.len())
        .expect("failed to find element end");

    content[start..end].to_string()
}

pub(crate) fn compact_xml(content: &str) -> String {
    content
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<String>()
}

pub(crate) fn minimal_diagram() -> diagram::Diagram {
    diagram::Diagram {
        xml_node_ids: Vec::new(),
        preserved_xml: Some(
            "<diagram><diagram_settings><database>MySQL</database><view_mode>1</view_mode></diagram_settings></diagram>"
                .to_string(),
        ),
        diagram_settings: minimal_diagram_settings(),
        diagram_walkers: None,
        vdiagrams: None,
        column_groups: None,
    }
}

pub(crate) fn minimal_diagram_settings() -> diagram_settings::DiagramSettings {
    diagram_settings::DiagramSettings {
        database: "MySQL".to_string(),
        view_mode: 1,
    }
}

fn temp_file_path(test_name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_write_{}_{}.erm",
        std::process::id(),
        test_name
    ))
}
