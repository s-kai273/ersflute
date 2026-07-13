use proc_macro::TokenStream;
use quote::quote;
use syn::{
    Data, DeriveInput, Error, Expr, Fields, LitStr, PathArguments, Result, Type, parse_macro_input,
    spanned::Spanned,
};

#[proc_macro_derive(Validate, attributes(validate))]
pub fn derive_validate(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    match expand_validate(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}

#[proc_macro_derive(XmlSchema, attributes(serde, xml_identity))]
pub fn derive_xml_schema(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    match expand_xml_schema(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}

#[proc_macro_derive(VisitIdentified)]
pub fn derive_visit_identified(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    match expand_visit_identified(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}

fn expand_visit_identified(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let ident = input.ident;
    let identity_kind = to_snake_case(&ident.to_string());
    let (visits, visits_mut) = match input.data {
        Data::Struct(data) => (
            expand_visit_identified_struct(&data.fields, false),
            expand_visit_identified_struct(&data.fields, true),
        ),
        Data::Enum(data) => (
            expand_visit_identified_enum(&data.variants, false),
            expand_visit_identified_enum(&data.variants, true),
        ),
        Data::Union(data) => {
            return Err(Error::new(
                data.union_token.span(),
                "VisitIdentified cannot be derived for unions",
            ));
        }
    };

    Ok(quote! {
        impl crate::identity::VisitIdentified for #ident {
            const IDENTITY_KIND: &'static str = #identity_kind;

            fn visit_identified<V: crate::identity::IdentifiedVisitor>(&self, visitor: &mut V) {
                #visits
            }

            fn visit_identified_mut<V: crate::identity::IdentifiedVisitorMut>(
                &mut self,
                visitor: &mut V,
            ) {
                #visits_mut
            }
        }
    })
}

fn expand_visit_identified_struct(fields: &Fields, mutable: bool) -> proc_macro2::TokenStream {
    let visits = fields.iter().enumerate().map(|(index, field)| {
        let access = field
            .ident
            .as_ref()
            .map(|ident| quote! { #ident })
            .unwrap_or_else(|| {
                let index = syn::Index::from(index);
                quote! { #index }
            });
        let method = if mutable {
            quote! { visit_identified_mut }
        } else {
            quote! { visit_identified }
        };
        let value = if mutable {
            quote! { &mut self.#access }
        } else {
            quote! { &self.#access }
        };

        quote! {
            crate::identity::VisitIdentified::#method(#value, visitor);
        }
    });

    quote! { #(#visits)* }
}

fn expand_visit_identified_enum(
    variants: &syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
    mutable: bool,
) -> proc_macro2::TokenStream {
    let method = if mutable {
        quote! { visit_identified_mut }
    } else {
        quote! { visit_identified }
    };
    let arms = variants.iter().map(|variant| {
        let ident = &variant.ident;

        match &variant.fields {
            Fields::Unit => quote! { Self::#ident => {} },
            Fields::Unnamed(fields) => {
                let bindings = (0..fields.unnamed.len())
                    .map(|index| syn::Ident::new(&format!("field_{index}"), variant.span()))
                    .collect::<Vec<_>>();
                let visits = bindings.iter().map(|binding| {
                    quote! {
                        crate::identity::VisitIdentified::#method(#binding, visitor);
                    }
                });

                quote! {
                    Self::#ident(#(#bindings),*) => {
                        #(#visits)*
                    }
                }
            }
            Fields::Named(fields) => {
                let bindings = fields
                    .named
                    .iter()
                    .filter_map(|field| field.ident.as_ref())
                    .collect::<Vec<_>>();
                let visits = bindings.iter().map(|binding| {
                    quote! {
                        crate::identity::VisitIdentified::#method(#binding, visitor);
                    }
                });

                quote! {
                    Self::#ident { #(#bindings),* } => {
                        #(#visits)*
                    }
                }
            }
        }
    });

    quote! {
        match self {
            #(#arms),*
        }
    }
}

fn expand_xml_schema(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let ident = input.ident;
    let tag = to_snake_case(&ident.to_string());

    match input.data {
        Data::Struct(data) => expand_xml_schema_struct(ident, tag, data.fields),
        Data::Enum(data) => expand_xml_schema_enum(ident, tag, data.variants),
        Data::Union(data) => Err(Error::new(
            data.union_token.span(),
            "XmlSchema cannot be derived for unions",
        )),
    }
}

fn expand_xml_schema_struct(
    ident: syn::Ident,
    tag: String,
    fields: Fields,
) -> Result<proc_macro2::TokenStream> {
    let fields = fields.iter().collect::<Vec<_>>();
    let field_tags = fields
        .iter()
        .map(|field| xml_field_child_match(field))
        .collect::<Result<Vec<_>>>()?;
    let identity_child_matches = fields
        .iter()
        .filter_map(|field| xml_identity_child_match(field).transpose())
        .collect::<Result<Vec<_>>>()?;
    let child_types = fields.iter().map(|field| &field.ty);
    let identity_child_types = fields.iter().map(|field| &field.ty);
    let own_child_match = if field_tags.is_empty() {
        quote! { false }
    } else {
        quote! { #(#field_tags)||* }
    };
    let own_identity_child_match = if identity_child_matches.is_empty() {
        quote! { false }
    } else {
        quote! { #(#identity_child_matches)||* }
    };

    Ok(quote! {
        impl crate::entities::XmlSchema for #ident {
            const XML_TAG: &'static str = #tag;

            fn is_known_child(parent: &str, tag: &str) -> bool {
                (parent == Self::XML_TAG && (#own_child_match))
                    #(|| <#child_types as crate::entities::XmlSchema>::is_known_child(parent, tag))*
            }

            fn is_identity_child(parent: &str, tag: &str) -> bool {
                (parent == Self::XML_TAG && (#own_identity_child_match))
                    #(|| <#identity_child_types as crate::entities::XmlSchema>::is_identity_child(parent, tag))*
            }

            fn is_known_value_child(_tag: &str) -> bool {
                false
            }

            fn is_identity_value_child(_tag: &str) -> bool {
                false
            }
        }
    })
}

fn expand_xml_schema_enum(
    ident: syn::Ident,
    tag: String,
    variants: syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
) -> Result<proc_macro2::TokenStream> {
    let variant_tags = variants
        .iter()
        .map(|variant| xml_renamed_tag(&variant.ident.to_string(), &variant.attrs))
        .collect::<Result<Vec<_>>>()?;
    let identity_variant_tags = variants
        .iter()
        .filter(|variant| has_xml_identity(&variant.attrs))
        .map(|variant| xml_renamed_tag(&variant.ident.to_string(), &variant.attrs))
        .collect::<Result<Vec<_>>>()?;
    let child_types = variants
        .iter()
        .flat_map(|variant| variant.fields.iter().map(|field| &field.ty));
    let identity_child_types = variants
        .iter()
        .flat_map(|variant| variant.fields.iter().map(|field| &field.ty));
    let own_child_match = if variant_tags.is_empty() {
        quote! { false }
    } else {
        quote! { matches!(tag, #(#variant_tags)|*) }
    };
    let own_identity_child_match = if identity_variant_tags.is_empty() {
        quote! { false }
    } else {
        quote! { matches!(tag, #(#identity_variant_tags)|*) }
    };

    Ok(quote! {
        impl crate::entities::XmlSchema for #ident {
            const XML_TAG: &'static str = #tag;

            fn is_known_child(parent: &str, tag: &str) -> bool {
                (parent == Self::XML_TAG && (#own_child_match))
                    #(|| <#child_types as crate::entities::XmlSchema>::is_known_child(parent, tag))*
            }

            fn is_identity_child(parent: &str, tag: &str) -> bool {
                (parent == Self::XML_TAG && (#own_identity_child_match))
                    #(|| <#identity_child_types as crate::entities::XmlSchema>::is_identity_child(parent, tag))*
            }

            fn is_known_value_child(tag: &str) -> bool {
                #own_child_match
            }

            fn is_identity_value_child(tag: &str) -> bool {
                #own_identity_child_match
            }
        }
    })
}

fn expand_validate(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let ident = input.ident;
    let rule_paths = collect_rule_paths(&input.attrs)?;

    let rule_calls = rule_paths.iter().map(|path| {
        quote! {
            #path(self)?;
        }
    });

    let child_validations = match input.data {
        Data::Struct(data) => expand_struct_fields(data.fields)?,
        Data::Enum(data) => expand_enum_variants(data.variants)?,
        Data::Union(data) => {
            return Err(Error::new(
                data.union_token.span(),
                "Validate cannot be derived for unions",
            ));
        }
    };

    Ok(quote! {
        impl crate::validation::Validate for #ident {
            fn validate(&self) -> Result<(), crate::validation::ValidationError> {
                #(#rule_calls)*
                #child_validations
                Ok(())
            }
        }
    })
}

fn expand_struct_fields(fields: Fields) -> Result<proc_macro2::TokenStream> {
    let validations = fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            let path = field_path(field)?;
            let access = field
                .ident
                .as_ref()
                .map(|ident| quote! { #ident })
                .unwrap_or_else(|| {
                    let index = syn::Index::from(index);
                    quote! { #index }
                });

            Ok(quote! {
                crate::validation::Validate::validate(&self.#access)
                    .map_err(|error| error.prepend_path(#path))?;
            })
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        #(#validations)*
    })
}

fn expand_enum_variants(
    variants: syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
) -> Result<proc_macro2::TokenStream> {
    let arms = variants
        .iter()
        .map(|variant| match &variant.fields {
            Fields::Unit => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident => {}
                })
            }
            Fields::Unnamed(fields) if fields.unnamed.len() == 1 => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident(value) => {
                        crate::validation::Validate::validate(value)?;
                    }
                })
            }
            Fields::Named(_) | Fields::Unnamed(_) => Err(Error::new(
                variant.span(),
                "Validate can only be derived for unit enum variants or single-value tuple variants",
            )),
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        match self {
            #(#arms)*
        }
    })
}

fn collect_rule_paths(attrs: &[syn::Attribute]) -> Result<Vec<syn::Path>> {
    let mut rule_paths = Vec::new();

    for attr in attrs.iter().filter(|attr| attr.path().is_ident("validate")) {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("rule") {
                let value = meta.value()?;
                rule_paths.push(value.parse()?);
                Ok(())
            } else if meta.path.is_ident("rules") {
                meta.parse_nested_meta(|rule| {
                    rule_paths.push(rule.path);
                    Ok(())
                })
            } else {
                Err(meta.error("unsupported validate attribute"))
            }
        })?;
    }

    Ok(rule_paths)
}

fn field_path(field: &syn::Field) -> Result<String> {
    let mut path = field
        .ident
        .as_ref()
        .map(ToString::to_string)
        .unwrap_or_default();

    for attr in field
        .attrs
        .iter()
        .filter(|attr| attr.path().is_ident("validate"))
    {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("path") {
                let value = meta.value()?;
                let override_path = value.parse::<LitStr>()?;
                path = override_path.value();
                Ok(())
            } else {
                Err(meta.error("unsupported validate attribute"))
            }
        })?;
    }

    Ok(path)
}

fn xml_field_child_match(field: &syn::Field) -> Result<proc_macro2::TokenStream> {
    let tag = xml_renamed_tag(
        &field
            .ident
            .as_ref()
            .map(ToString::to_string)
            .unwrap_or_default(),
        &field.attrs,
    )?;

    if tag == "$value" {
        let ty = &field.ty;
        Ok(quote! { <#ty as crate::entities::XmlSchema>::is_known_value_child(tag) })
    } else {
        Ok(quote! { matches!(tag, #tag) })
    }
}

fn xml_identity_child_match(field: &syn::Field) -> Result<Option<proc_macro2::TokenStream>> {
    let tag = xml_renamed_tag(
        &field
            .ident
            .as_ref()
            .map(ToString::to_string)
            .unwrap_or_default(),
        &field.attrs,
    )?;

    if tag == "$value" {
        if !is_repeated_type(&field.ty) {
            return Ok(None);
        }
        let ty = &field.ty;
        Ok(Some(
            quote! { <#ty as crate::entities::XmlSchema>::is_identity_value_child(tag) },
        ))
    } else if !is_identity_field(field)? || !is_repeated_type(&field.ty) {
        Ok(None)
    } else {
        Ok(Some(quote! { matches!(tag, #tag) }))
    }
}

fn is_identity_field(field: &syn::Field) -> Result<bool> {
    Ok(is_repeated_type(&field.ty) && has_xml_identity(&field.attrs))
}

fn has_xml_identity(attrs: &[syn::Attribute]) -> bool {
    attrs
        .iter()
        .any(|attr| attr.path().is_ident("xml_identity"))
}

fn is_repeated_type(ty: &Type) -> bool {
    type_path_ident(ty, "Vec").is_some()
        || type_path_ident(ty, "Option").is_some_and(type_arg_is_vec)
}

fn type_arg_is_vec(arguments: &PathArguments) -> bool {
    let PathArguments::AngleBracketed(arguments) = arguments else {
        return false;
    };

    arguments.args.iter().any(|argument| match argument {
        syn::GenericArgument::Type(ty) => type_path_ident(ty, "Vec").is_some(),
        _ => false,
    })
}

fn type_path_ident<'a>(ty: &'a Type, ident: &str) -> Option<&'a PathArguments> {
    let Type::Path(path) = ty else {
        return None;
    };

    let segment = path.path.segments.last()?;
    if segment.ident == ident {
        Some(&segment.arguments)
    } else {
        None
    }
}

fn xml_renamed_tag(default_name: &str, attrs: &[syn::Attribute]) -> Result<String> {
    let mut tag = default_name.to_string();

    for attr in attrs.iter().filter(|attr| attr.path().is_ident("serde")) {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("rename") {
                let value = meta.value()?;
                tag = value.parse::<LitStr>()?.value();
                Ok(())
            } else if meta.input.peek(syn::Token![=]) {
                let value = meta.value()?;
                let _ = value.parse::<Expr>()?;
                Ok(())
            } else {
                Ok(())
            }
        })?;
    }

    Ok(tag)
}

fn to_snake_case(value: &str) -> String {
    let mut result = String::new();

    for (index, character) in value.chars().enumerate() {
        if character.is_uppercase() {
            if index > 0 {
                result.push('_');
            }
            result.extend(character.to_lowercase());
        } else {
            result.push(character);
        }
    }

    result
}
