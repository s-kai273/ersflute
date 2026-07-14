pub mod diagram;

pub use erm_macros::XmlSchema;

/// Runtime access to the XML schema of one concrete entity type.
///
/// A context only describes the direct children of its current type. XML
/// readers start with the root entity's context and call [`Self::child`] for
/// each child element while descending the XML tree. The returned context is
/// tied to the child field's concrete Rust type, so identically named XML
/// elements owned by different types do not share schema information.
///
/// Child classification uses all three operations: a missing child context is
/// unsupported XML, a known non-repeated child is merged by tag, a repeated
/// child without identity is rebuilt from managed XML, and an identity child
/// is matched with its preserved counterpart before merging.
#[derive(Clone, Copy)]
pub struct XmlSchemaContext {
    /// Returns the concrete schema context for a known direct child tag.
    /// Returning `None` marks that child as unsupported by the current type.
    child_schema: fn(&str) -> Option<Self>,
    /// Reports whether a direct child tag uses `#[xml_identity]` and can be
    /// matched with the same preserved element across edits and reordering.
    is_identity_child: fn(&str) -> bool,
    /// Reports whether a direct child tag is serialized from `Vec<T>` or
    /// `Option<Vec<T>>` and must therefore follow repeated-element merge rules.
    is_repeated_child: fn(&str) -> bool,
}

impl XmlSchemaContext {
    pub fn new(
        child_schema: fn(&str) -> Option<Self>,
        is_identity_child: fn(&str) -> bool,
        is_repeated_child: fn(&str) -> bool,
    ) -> Self {
        Self {
            child_schema,
            is_identity_child,
            is_repeated_child,
        }
    }

    pub fn leaf() -> Self {
        Self::new(no_child_schema, no_child_match, no_child_match)
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

macro_rules! impl_leaf_xml_schema {
    ($($ty:ty),* $(,)?) => {
        $(
            impl XmlSchema for $ty {
                const XML_TAG: &'static str = "";
            }
        )*
    };
}

impl_leaf_xml_schema!(crate::column_type::ColumnType, String, bool, i64, u8, u16);

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
