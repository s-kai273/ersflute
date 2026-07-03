pub mod diagram;

pub use erm_macros::XmlSchema;

pub trait XmlSchema {
    const XML_TAG: &'static str;

    fn is_known_child(parent: &str, tag: &str) -> bool;

    fn is_identity_child(parent: &str, tag: &str) -> bool;

    fn is_known_value_child(tag: &str) -> bool;

    fn is_identity_value_child(tag: &str) -> bool;
}

macro_rules! impl_leaf_xml_schema {
    ($($ty:ty),* $(,)?) => {
        $(
            impl XmlSchema for $ty {
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
        )*
    };
}

impl_leaf_xml_schema!(crate::column_type::ColumnType, String, bool, i64, u8, u16);

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
