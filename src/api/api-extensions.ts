import gql from 'graphql-tag'
export { Collection } from '@vendure/common/lib/generated-types'

export const commonApiExtensions = gql`
    enum EmailPartialType {
        HEADER
        FOOTER
    }

    type EmailTemplateTranslation {
        languageCode: String!
        description: String!
        body: String!
    }

    type EmailTemplate implements Node {
        id: ID!
        title: String!
        createdAt: DateTime!
        updatedAt: DateTime!
        status: Status!
        channels: [Channel!]
        translations: [EmailTemplateTranslation!]
        emailPartials: [EmailPartial]
    }

    type EmailPartialTranslation {
        languageCode: String!
        title: String!
        description: String!
        body: String!
    }

    type EmailPartial implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        partialType: EmailPartialType!
        status: Status!
        template: EmailTemplate
        translations: [EmailPartialTranslation!]
    }

    type EmailTemplateList implements PaginatedList {
        items: [EmailTemplate!]!
        totalItems: Int!
    }

    type EmailPartialList implements PaginatedList {
        items: [EmailPartial!]!
        totalItems: Int!
    }

    # Auto-generated at runtime
    input EmailTemplateListOptions
`

export const shopApiExtensions = gql`
    ${commonApiExtensions}
`

export const adminApiExtensions = gql`
    ${commonApiExtensions}

    extend type Mutation {
        listEmailTemplates(
            options: EmailTemplateListOptions
        ): EmailTemplateList!
        createEmailTemplate(input: CreateEmailTemplateInput!): EmailTemplate!
        updateEmailTemplate(input: UpdateEmailTemplateInput!): EmailTemplate!
        softDeleteEmailTemplate(id: ID!): DeletionResponse
        hardDeleteEmailTemplate(id: ID!): DeletionResponse
        publishEmailTemplate(id: ID!): EmailTemplate!
        unpublishEmailTemplate(id: ID!): EmailTemplate!

        createEmailPartial(input: CreateEmailPartialInput!): EmailPartial!
        updateEmailPartial(input: UpdateEmailPartialInput!): EmailPartial!
        listEmailPartials(
            options: EmailTemplateListOptions
            templateId: ID
        ): EmailPartialList!
        hardDeleteEmailPartial(id: ID!): DeletionResponse
    }

    input EmailTemplateTranslationInput {
        description: String!
        body: String!
        languageCode: String!
    }

    input CreateEmailTemplateInput {
        status: Status!
        channels: [ID!]!
        title: String!
        translations: [EmailTemplateTranslationInput!]!
    }

    input UpdateEmailTemplateInput {
        id: ID!
        status: Status
        channels: [ID]
        translations: [EmailTemplateTranslationInput]
    }

    input EmailPartialTranslationInput {
        title: String!
        description: String!
        body: String!
        languageCode: String!
    }

    input CreateEmailPartialInput {
        partialType: EmailPartialType!
        status: Status!
        templateId: ID!
        translations: [EmailPartialTranslationInput!]!
    }

    input UpdateEmailPartialInput {
        id: ID!
        partialType: EmailPartialType
        status: Status
        templateId: ID
        translations: [EmailPartialTranslationInput]
    }
`
