use std::fs;

use erm::dtos::diagram::Diagram;
use erm::save;

pub(crate) fn save_diagram_to_string(diagram: Diagram, test_name: &str) -> String {
    let path = temp_file_path(test_name);

    save(path.to_str().expect("invalid temp path"), diagram).expect("failed to write");

    let content = fs::read_to_string(&path).expect("failed to read written file");
    fs::remove_file(&path).expect("failed to remove temp file");

    content
}

fn temp_file_path(test_name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!(
        "erm_write_{}_{}.erm",
        std::process::id(),
        test_name
    ))
}
