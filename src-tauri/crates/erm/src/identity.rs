use crate::dtos::Identified;

pub(crate) use erm_macros::VisitIdentified;

pub(crate) trait IdentifiedVisitor {
    fn visit_identified<T: VisitIdentified>(&mut self, value: &Identified<T>);
}

pub(crate) trait IdentifiedVisitorMut {
    fn visit_identified_mut<T: VisitIdentified>(&mut self, value: &mut Identified<T>);
}

pub(crate) trait VisitIdentified {
    const IDENTITY_KIND: &'static str;

    fn visit_identified<V: IdentifiedVisitor>(&self, visitor: &mut V);

    fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, visitor: &mut V);
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

macro_rules! impl_noop_visit_identified {
    ($($ty:ty),+ $(,)?) => {
        $(
            impl VisitIdentified for $ty {
                const IDENTITY_KIND: &'static str = "";

                fn visit_identified<V: IdentifiedVisitor>(&self, _visitor: &mut V) {}

                fn visit_identified_mut<V: IdentifiedVisitorMut>(&mut self, _visitor: &mut V) {}
            }
        )+
    };
}

impl_noop_visit_identified!(
    String,
    bool,
    u8,
    u16,
    u32,
    u64,
    usize,
    i8,
    i16,
    i32,
    i64,
    isize,
    f32,
    f64,
    crate::column_type::ColumnType,
    crate::entities::diagram::diagram_walkers::tables::connections::ChildCardinality,
    crate::entities::diagram::diagram_walkers::tables::connections::ParentCardinality,
    crate::entities::diagram::diagram_walkers::tables::connections::OnAction
);
