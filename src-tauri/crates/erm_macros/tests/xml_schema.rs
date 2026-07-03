#![allow(dead_code)]

use erm_macros::XmlSchema;

use crate::entities::XmlSchema as _;

mod entities {
    pub trait XmlSchema {
        const XML_TAG: &'static str;

        fn is_known_child(parent: &str, tag: &str) -> bool;

        fn is_identity_child(parent: &str, tag: &str) -> bool;

        fn is_known_value_child(tag: &str) -> bool;

        fn is_identity_value_child(tag: &str) -> bool;
    }

    impl XmlSchema for String {
        const XML_TAG: &'static str = "";

        fn is_known_child(_parent: &str, _tag: &str) -> bool {
            false
        }

        fn is_identity_child(_parent: &str, _tag: &str) -> bool {
            false
        }

        fn is_known_value_child(_tag: &str) -> bool {
            false
        }

        fn is_identity_value_child(_tag: &str) -> bool {
            false
        }
    }

    impl<T: XmlSchema> XmlSchema for Option<T> {
        const XML_TAG: &'static str = T::XML_TAG;

        fn is_known_child(parent: &str, tag: &str) -> bool {
            T::is_known_child(parent, tag)
        }

        fn is_identity_child(parent: &str, tag: &str) -> bool {
            T::is_identity_child(parent, tag)
        }

        fn is_known_value_child(tag: &str) -> bool {
            T::is_known_value_child(tag)
        }

        fn is_identity_value_child(tag: &str) -> bool {
            T::is_identity_value_child(tag)
        }
    }

    impl<T: XmlSchema> XmlSchema for Vec<T> {
        const XML_TAG: &'static str = T::XML_TAG;

        fn is_known_child(parent: &str, tag: &str) -> bool {
            T::is_known_child(parent, tag)
        }

        fn is_identity_child(parent: &str, tag: &str) -> bool {
            T::is_identity_child(parent, tag)
        }

        fn is_known_value_child(tag: &str) -> bool {
            T::is_known_value_child(tag)
        }

        fn is_identity_value_child(tag: &str) -> bool {
            T::is_identity_value_child(tag)
        }
    }
}

#[derive(XmlSchema)]
struct Root {
    visible_name: String,

    #[serde(rename = "renamed_child")]
    renamed: RenamedChild,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    optional_children: Option<Vec<OptionalChildren>>,

    #[serde(rename = "$value")]
    items: Vec<Item>,

    #[serde(rename = "skipped_child")]
    #[xml_schema_override(identity = false)]
    skipped_children: Vec<SkippedChild>,
}

#[derive(XmlSchema)]
struct RenamedChild {
    value: String,
}

#[derive(XmlSchema)]
struct OptionalChildren {
    label: String,
}

#[derive(XmlSchema)]
struct SkippedChild {
    value: String,
}

#[derive(XmlSchema)]
enum Item {
    #[serde(rename = "first_item")]
    First(String),

    #[serde(rename = "second_item")]
    Second(String),

    #[serde(rename = "skipped_item")]
    #[xml_schema_override(identity = false)]
    Skipped(String),
}

#[test]
fn field_names_are_known_children_of_the_derived_type_tag() {
    assert!(Root::is_known_child("root", "visible_name"));
}

#[test]
fn serde_renames_are_used_as_child_tags() {
    assert!(Root::is_known_child("root", "renamed_child"));
    assert!(!Root::is_known_child("root", "renamed"));
}

#[test]
fn optional_vector_child_types_are_checked_recursively() {
    assert!(Root::is_known_child("optional_children", "label"));
}

#[test]
fn value_fields_use_enum_variant_tags_as_children_of_the_container() {
    assert!(Root::is_known_child("root", "first_item"));
    assert!(Root::is_known_child("root", "second_item"));
    assert!(Root::is_known_child("root", "skipped_item"));
}

#[test]
fn non_vector_fields_are_not_identity_children() {
    assert!(!Root::is_identity_child("root", "visible_name"));
    assert!(!Root::is_identity_child("root", "renamed_child"));
}

#[test]
fn vector_fields_are_identity_children_by_default() {
    assert!(Root::is_identity_child("root", "optional_children"));
}

#[test]
fn value_vector_fields_use_enum_variant_tags_as_identity_children() {
    assert!(Root::is_identity_child("root", "first_item"));
    assert!(Root::is_identity_child("root", "second_item"));
    assert!(!Root::is_identity_child("root", "skipped_item"));
}

#[test]
fn identity_can_be_disabled_for_vector_fields() {
    assert!(!Root::is_identity_child("root", "skipped_child"));
}
