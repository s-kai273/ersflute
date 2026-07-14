use std::collections::HashMap;

use super::xml_preservation::XmlNodeIdentity;
use crate::dtos::Identified;
use crate::dtos::diagram::Diagram;
use crate::identity::{IdentifiedVisitor, IdentifiedVisitorMut, VisitIdentified};

type IdentityIndexLookup<'a> = HashMap<(&'a str, Option<&'a str>, usize), &'a str>;
type IdentityCounterKey = (Option<String>, &'static str);

pub(crate) fn attach_identity_keys(diagram: &mut Diagram, identities: &[XmlNodeIdentity]) {
    let lookup = identity_index_lookup(identities);
    let mut visitor = AttachIdentityVisitor::new(&lookup);

    diagram.visit_identified_mut(&mut visitor);
}

pub(crate) fn collect_identity_keys(diagram: &Diagram) -> Vec<XmlNodeIdentity> {
    let mut visitor = CollectIdentityVisitor::default();

    diagram.visit_identified(&mut visitor);

    visitor.identities
}

struct AttachIdentityVisitor<'a> {
    lookup: &'a IdentityIndexLookup<'a>,
    traversal: IdentityTraversal,
}

impl<'a> AttachIdentityVisitor<'a> {
    fn new(lookup: &'a IdentityIndexLookup<'a>) -> Self {
        Self {
            lookup,
            traversal: IdentityTraversal::default(),
        }
    }
}

impl IdentifiedVisitorMut for AttachIdentityVisitor<'_> {
    fn visit_identified_mut<T: VisitIdentified>(&mut self, value: &mut Identified<T>) {
        let tag = T::IDENTITY_KIND;
        let (parent_id, index) = self.traversal.next_identity(tag);

        value.identity_key = self
            .lookup
            .get(&(tag, parent_id.as_deref(), index))
            .map(|identity_key| (*identity_key).to_string());

        self.traversal.push_parent(value.identity_key.clone());
        value.as_mut().visit_identified_mut(self);
        self.traversal.pop_parent();
    }
}

#[derive(Default)]
struct CollectIdentityVisitor {
    identities: Vec<XmlNodeIdentity>,
    traversal: IdentityTraversal,
}

#[derive(Default)]
struct IdentityTraversal {
    parent_ids: Vec<Option<String>>,
    next_indexes: HashMap<IdentityCounterKey, usize>,
}

impl IdentityTraversal {
    fn next_identity(&mut self, tag: &'static str) -> (Option<String>, usize) {
        let parent_id = self.parent_ids.last().cloned().flatten();
        let next_index = self
            .next_indexes
            .entry((parent_id.clone(), tag))
            .or_default();
        let index = *next_index;
        *next_index += 1;

        (parent_id, index)
    }

    fn push_parent(&mut self, parent_id: Option<String>) {
        self.parent_ids.push(parent_id);
    }

    fn pop_parent(&mut self) {
        self.parent_ids.pop();
    }
}

impl IdentifiedVisitor for CollectIdentityVisitor {
    fn visit_identified<T: VisitIdentified>(&mut self, value: &Identified<T>) {
        let tag = T::IDENTITY_KIND;
        let (parent_id, index) = self.traversal.next_identity(tag);

        if let Some(identity_key) = &value.identity_key {
            self.identities.push(XmlNodeIdentity {
                id: identity_key.clone(),
                tag: tag.to_string(),
                parent_id: parent_id.clone(),
                index,
            });
        }

        self.traversal.push_parent(value.identity_key.clone());
        value.as_ref().visit_identified(self);
        self.traversal.pop_parent();
    }
}

fn identity_index_lookup(identities: &[XmlNodeIdentity]) -> IdentityIndexLookup<'_> {
    identities
        .iter()
        .map(|identity| {
            (
                (
                    identity.tag.as_str(),
                    identity.parent_id.as_deref(),
                    identity.index,
                ),
                identity.id.as_str(),
            )
        })
        .collect()
}
