#![allow(dead_code)]

use erm_macros::XmlSchema;

use crate::entities::XmlSchema as _;

mod entities {
    #[derive(Clone, Copy)]
    pub struct XmlSchemaContext {
        is_leaf: bool,
        child_schema: fn(&str) -> Option<Self>,
        is_identity_child: fn(&str) -> bool,
        is_repeated_child: fn(&str) -> bool,
    }

    impl XmlSchemaContext {
        pub fn new(
            child_schema: fn(&str) -> Option<Self>,
            is_identity_child: fn(&str) -> bool,
            is_repeated_child: fn(&str) -> bool,
        ) -> Self {
            Self {
                is_leaf: false,
                child_schema,
                is_identity_child,
                is_repeated_child,
            }
        }

        pub fn leaf() -> Self {
            Self {
                is_leaf: true,
                child_schema: no_child_schema,
                is_identity_child: no_child_match,
                is_repeated_child: no_child_match,
            }
        }

        pub fn is_leaf(self) -> bool {
            self.is_leaf
        }

        pub fn child(self, tag: &str) -> Option<Self> {
            (self.child_schema)(tag)
        }

        pub fn is_identity_child(self, tag: &str) -> bool {
            (self.is_identity_child)(tag)
        }

        pub fn is_repeated_child(self, tag: &str) -> bool {
            (self.is_repeated_child)(tag)
        }
    }

    fn no_child_schema(_tag: &str) -> Option<XmlSchemaContext> {
        None
    }

    fn no_child_match(_tag: &str) -> bool {
        false
    }

    pub trait XmlSchema {
        const XML_TAG: &'static str;

        fn xml_schema() -> XmlSchemaContext {
            XmlSchemaContext::new(
                Self::child_schema,
                Self::is_identity_child,
                Self::is_repeated_child,
            )
        }

        fn child_schema(_tag: &str) -> Option<XmlSchemaContext> {
            None
        }

        fn is_identity_child(_tag: &str) -> bool {
            false
        }

        fn is_repeated_child(_tag: &str) -> bool {
            false
        }

        fn value_child_schema(_tag: &str) -> Option<XmlSchemaContext> {
            None
        }

        fn is_identity_value_child(_tag: &str) -> bool {
            false
        }
    }

    impl XmlSchema for String {
        const XML_TAG: &'static str = "";

        fn xml_schema() -> XmlSchemaContext {
            XmlSchemaContext::leaf()
        }
    }

    impl<T: XmlSchema> XmlSchema for Option<T> {
        const XML_TAG: &'static str = T::XML_TAG;

        fn xml_schema() -> XmlSchemaContext {
            T::xml_schema()
        }

        fn value_child_schema(tag: &str) -> Option<XmlSchemaContext> {
            T::value_child_schema(tag)
        }

        fn is_identity_value_child(tag: &str) -> bool {
            T::is_identity_value_child(tag)
        }
    }

    impl<T: XmlSchema> XmlSchema for Vec<T> {
        const XML_TAG: &'static str = T::XML_TAG;

        fn xml_schema() -> XmlSchemaContext {
            T::xml_schema()
        }

        fn value_child_schema(tag: &str) -> Option<XmlSchemaContext> {
            T::value_child_schema(tag)
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
    #[xml_identity]
    optional_children: Option<Vec<OptionalChildren>>,

    #[serde(rename = "$value")]
    items: Vec<Item>,

    #[serde(rename = "skipped_child")]
    skipped_children: Vec<SkippedChild>,

    optional_skipped_children: Option<Vec<SkippedChild>>,
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
    #[xml_identity]
    First(String),

    #[serde(rename = "second_item")]
    #[xml_identity]
    Second(String),

    #[serde(rename = "skipped_item")]
    Skipped(String),
}

#[derive(XmlSchema)]
struct FirstContainer {
    #[serde(rename = "columns")]
    value: FirstColumns,
}

#[derive(XmlSchema)]
struct FirstColumns {
    first_only: String,
}

#[derive(XmlSchema)]
struct SecondContainer {
    #[serde(rename = "columns")]
    value: SecondColumns,
}

#[derive(XmlSchema)]
struct SecondColumns {
    second_only: String,
}

#[test]
fn field_names_are_known_children_of_the_derived_type_tag() {
    assert!(Root::xml_schema().child("visible_name").is_some());
}

#[test]
fn scalar_fields_are_leaf_children() {
    assert!(
        Root::xml_schema()
            .child("visible_name")
            .expect("missing scalar field schema")
            .is_leaf()
    );
}

#[test]
fn structured_fields_are_not_leaf_children() {
    assert!(
        !Root::xml_schema()
            .child("renamed_child")
            .expect("missing structured field schema")
            .is_leaf()
    );
}

#[test]
fn serde_renames_are_used_as_child_tags() {
    assert!(Root::xml_schema().child("renamed_child").is_some());
    assert!(Root::xml_schema().child("renamed").is_none());
}

#[test]
fn optional_vector_child_types_are_checked_recursively() {
    let children = Root::xml_schema()
        .child("optional_children")
        .expect("missing optional children schema");

    assert!(children.child("label").is_some());
}

#[test]
fn value_fields_use_enum_variant_tags_as_children_of_the_container() {
    let root = Root::xml_schema();

    assert!(root.child("first_item").is_some());
    assert!(root.child("second_item").is_some());
    assert!(root.child("skipped_item").is_some());
}

#[test]
fn non_vector_fields_are_not_identity_children() {
    let root = Root::xml_schema();

    assert!(!root.is_identity_child("visible_name"));
    assert!(!root.is_identity_child("renamed_child"));
}

#[test]
fn annotated_vector_fields_are_identity_children() {
    assert!(Root::xml_schema().is_identity_child("optional_children"));
}

#[test]
fn value_vector_fields_use_enum_variant_tags_as_identity_children() {
    let root = Root::xml_schema();

    assert!(root.is_identity_child("first_item"));
    assert!(root.is_identity_child("second_item"));
    assert!(!root.is_identity_child("skipped_item"));
}

#[test]
fn regular_vector_fields_are_not_identity_children() {
    assert!(!Root::xml_schema().is_identity_child("skipped_child"));
}

#[test]
fn vector_fields_are_repeated_children() {
    assert!(Root::xml_schema().is_repeated_child("skipped_child"));
}

#[test]
fn optional_vector_fields_are_repeated_children() {
    assert!(Root::xml_schema().is_repeated_child("optional_skipped_children"));
}

#[test]
fn value_vector_fields_use_enum_variant_tags_as_repeated_children() {
    let root = Root::xml_schema();

    assert!(root.is_repeated_child("first_item"));
    assert!(root.is_repeated_child("second_item"));
    assert!(root.is_repeated_child("skipped_item"));
}

#[test]
fn non_vector_fields_are_not_repeated_children() {
    let root = Root::xml_schema();

    assert!(!root.is_repeated_child("visible_name"));
    assert!(!root.is_repeated_child("renamed_child"));
}

#[test]
fn identical_xml_tags_keep_their_concrete_type_context() {
    let first_columns = FirstContainer::xml_schema()
        .child("columns")
        .expect("missing first columns schema");
    let second_columns = SecondContainer::xml_schema()
        .child("columns")
        .expect("missing second columns schema");

    assert!(first_columns.child("first_only").is_some());
    assert!(first_columns.child("second_only").is_none());
    assert!(second_columns.child("first_only").is_none());
    assert!(second_columns.child("second_only").is_some());
}
