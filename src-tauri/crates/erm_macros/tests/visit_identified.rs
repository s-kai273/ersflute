#![allow(dead_code)]

use erm_macros::VisitIdentified;

use crate::identity::{IdentifiedVisitor, IdentifiedVisitorMut, VisitIdentified as _};

mod identity {
    pub trait IdentifiedVisitor {
        fn visit_identified<T: VisitIdentified>(&mut self, value: &Identified<T>);
    }

    pub trait IdentifiedVisitorMut {
        fn visit_identified_mut<T: VisitIdentified>(&mut self, value: &mut Identified<T>);
    }

    pub trait VisitIdentified {
        const IDENTITY_KIND: &'static str;

        fn visit_identified<V: IdentifiedVisitor>(&self, visitor: &mut V);

        fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, visitor: &mut V);
    }

    pub struct Identified<T> {
        value: T,
    }

    impl<T> Identified<T> {
        pub fn new(value: T) -> Self {
            Self { value }
        }
    }

    impl<T> AsRef<T> for Identified<T> {
        fn as_ref(&self) -> &T {
            &self.value
        }
    }

    impl<T> AsMut<T> for Identified<T> {
        fn as_mut(&mut self) -> &mut T {
            &mut self.value
        }
    }

    impl<T: VisitIdentified> VisitIdentified for Identified<T> {
        const IDENTITY_KIND: &'static str = T::IDENTITY_KIND;

        fn visit_identified<V: IdentifiedVisitor>(&self, visitor: &mut V) {
            visitor.visit_identified(self);
        }

        fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, visitor: &mut V) {
            visitor.visit_identified_mut(self);
        }
    }

    impl<T: VisitIdentified> VisitIdentified for Option<T> {
        const IDENTITY_KIND: &'static str = T::IDENTITY_KIND;

        fn visit_identified<V: IdentifiedVisitor>(&self, visitor: &mut V) {
            if let Some(value) = self {
                value.visit_identified(visitor);
            }
        }

        fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, visitor: &mut V) {
            if let Some(value) = self {
                value.visit_identified_mut(visitor);
            }
        }
    }

    impl<T: VisitIdentified> VisitIdentified for Vec<T> {
        const IDENTITY_KIND: &'static str = T::IDENTITY_KIND;

        fn visit_identified<V: IdentifiedVisitor>(&self, visitor: &mut V) {
            for value in self {
                value.visit_identified(visitor);
            }
        }

        fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, visitor: &mut V) {
            for value in self {
                value.visit_identified_mut(visitor);
            }
        }
    }

    impl VisitIdentified for String {
        const IDENTITY_KIND: &'static str = "";

        fn visit_identified<V: IdentifiedVisitor>(&self, _visitor: &mut V) {}

        fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, _visitor: &mut V) {}
    }
}

use identity::Identified;

#[derive(VisitIdentified)]
struct Root {
    nested: Option<Nested>,
    plain: String,
}

#[derive(VisitIdentified)]
struct Nested {
    tables: Vec<Identified<Table>>,
    plain_tables: Vec<Table>,
    item: Item,
}

#[derive(VisitIdentified)]
struct Table {
    name: String,
}

#[derive(VisitIdentified)]
enum Item {
    Normal(Identified<NormalColumn>),
    Group(String),
}

#[derive(VisitIdentified)]
struct NormalColumn {
    name: String,
}

#[derive(VisitIdentified)]
struct Vdiagram {}

#[derive(Default)]
struct KindCollector {
    kinds: Vec<&'static str>,
}

impl IdentifiedVisitor for KindCollector {
    fn visit_identified<T: identity::VisitIdentified>(&mut self, value: &Identified<T>) {
        self.kinds.push(T::IDENTITY_KIND);
        value.as_ref().visit_identified(self);
    }
}

impl IdentifiedVisitorMut for KindCollector {
    fn visit_identified_mut<T: identity::VisitIdentified>(&mut self, value: &mut Identified<T>) {
        self.kinds.push(T::IDENTITY_KIND);
        value.as_mut().visit_identified_mut(self);
    }
}

fn root() -> Root {
    Root {
        nested: Some(Nested {
            tables: vec![Identified::new(Table {
                name: "identified".to_string(),
            })],
            plain_tables: vec![Table {
                name: "plain".to_string(),
            }],
            item: Item::Normal(Identified::new(NormalColumn {
                name: "column".to_string(),
            })),
        }),
        plain: "root".to_string(),
    }
}

#[test]
fn visits_only_identified_values_through_nested_collections_and_enum_variants() {
    let root = root();
    let mut collector = KindCollector::default();

    root.visit_identified(&mut collector);

    assert_eq!(collector.kinds, ["table", "normal_column"]);
}

#[test]
fn mutable_visits_follow_the_same_identified_structure() {
    let mut root = root();
    let mut collector = KindCollector::default();

    root.visit_identified_mut(&mut collector);

    assert_eq!(collector.kinds, ["table", "normal_column"]);
}

#[test]
fn identity_kinds_are_generated_from_dto_type_names() {
    assert_eq!(Vdiagram::IDENTITY_KIND, "vdiagram");
    assert_eq!(NormalColumn::IDENTITY_KIND, "normal_column");
}
