use std::ops::{Deref, DerefMut};

use serde::{Deserialize, Serialize};

use crate::validation::Validate;

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Identified<T> {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub identity_key: Option<String>,

    #[serde(flatten)]
    value: T,
}

impl<T> Identified<T> {
    pub fn new(value: T) -> Self {
        Self {
            identity_key: None,
            value,
        }
    }

    pub fn with_identity_key(value: T, identity_key: impl Into<String>) -> Self {
        Self {
            identity_key: Some(identity_key.into()),
            value,
        }
    }

    pub fn into_inner(self) -> T {
        self.value
    }

    pub fn map<U>(self, convert: impl FnOnce(T) -> U) -> Identified<U> {
        Identified {
            identity_key: self.identity_key,
            value: convert(self.value),
        }
    }
}

impl<T> From<T> for Identified<T> {
    fn from(value: T) -> Self {
        Self::new(value)
    }
}

impl<T> Deref for Identified<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.value
    }
}

impl<T> DerefMut for Identified<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.value
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

impl<T: Validate> Validate for Identified<T> {
    fn validate(&self) -> Result<(), crate::validation::ValidationError> {
        self.value.validate()
    }
}

pub(crate) fn identified_from_entity<E, D>(entity: E) -> Identified<D>
where
    D: From<E>,
{
    Identified::new(entity.into())
}

pub(crate) fn identified_into_entity<D, E>(dto: Identified<D>) -> E
where
    E: From<D>,
{
    E::from(dto.into_inner())
}
