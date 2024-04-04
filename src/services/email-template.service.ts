import { Injectable } from '@nestjs/common'
import {
    ChannelService,
    ID,
    ListQueryBuilder,
    ListQueryOptions,
    PaginatedList,
    RequestContext,
    TransactionalConnection,
    TranslatableSaver,
    TranslatorService,
} from '@vendure/core'
import { EmailTemplateTranslation } from '../entities/email-template-translation.entity'
import { EmailTemplate } from '../entities/email-template.entity'
import { Status } from '../enums/status.enum'

// TODO: Set up graphql-code-generator to generate the types for the following inputs
type CreateEmailTemplateInput = any
type UpdateEmailTemplateInput = any

@Injectable()
export class EmailTemplateService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private channelService: ChannelService,
        private translator: TranslatorService,
        private translatableSaver: TranslatableSaver,
    ) {}

    /**
     * Retrieves a paginated list of all email templates based on the provided ListQueryOptions within the RequestContext.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param options - The options for the list query, specifying filters, sorting, and pagination.
     * @returns A Promise that resolves to a PaginatedList of email templates.
     */
    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<EmailTemplate>,
    ): Promise<PaginatedList<EmailTemplate>> {
        return await this.listQueryBuilder
            .build(EmailTemplate, options, {
                channelId: ctx.channelId,
                where: { deletedAt: null || undefined },
                ctx,
            })
            .getManyAndCount()
            .then(([templates, totalItems]) => {
                const items = templates.map((template) =>
                    this.translator.translate(template, ctx),
                )
                return {
                    items,
                    totalItems,
                }
            })
    }

    /**
     * Retrieves a specific email template based on its ID within the RequestContext.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email template to be retrieved.
     * @returns A Promise that resolves to the specified email template.
     */
    async findOne(
        ctx: RequestContext,
        id: string,
    ): Promise<EmailTemplate | undefined> {
        const template = await this.connection.findOneInChannel(
            ctx,
            EmailTemplate,
            id,
            ctx.channelId,
            {
                where: {
                    deletedAt: null || undefined,
                },
            },
        )
        if (!template) {
            return
        }
        return this.translator.translate(template, ctx)
    }

    /**
     * Creates a new email template.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param input - The data required to create the new email template.
     * @returns A Promise that resolves to the newly created email template.
     */
    async create(
        ctx: RequestContext,
        input: CreateEmailTemplateInput,
    ): Promise<EmailTemplate> {
        input['createdBy'] = ctx.activeUserId
        console.log(input)
        return await this.translatableSaver.create({
            ctx,
            input,
            entityType: EmailTemplate,
            translationType: EmailTemplateTranslation,
            beforeSave: async (template) => {
                await this.channelService.assignToCurrentChannel(template, ctx)
            },
        })
    }

    /**
     * Updates an existing email template.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param input - The data required to update the email template.
     * @returns A Promise that resolves to the updated email template.
     */
    async update(
        ctx: RequestContext,
        input: UpdateEmailTemplateInput,
    ): Promise<EmailTemplate> {
        await this.connection.getEntityOrThrow(ctx, EmailTemplate, input.id)

        // Assign active user ID to the operation
        input['updatedBy'] = ctx.activeUserId

        return await this.translatableSaver.update({
            ctx,
            input,
            entityType: EmailTemplate,
            translationType: EmailTemplateTranslation,
        })
    }

    // /**
    //  * Soft deletes an email template.
    //  *
    //  * @param ctx - The RequestContext containing information about the request.
    //  * @param id - The ID of the email template to be soft deleted.
    //  * @returns A Promise that resolves to a DeletionResponse.
    //  */
    // async softDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
    //     const template = await this.connection.getEntityOrThrow(
    //         ctx,
    //         EmailTemplate,
    //         id,
    //         {},
    //     )
    //     //TODO: handle deletedAt
    //     template.status = Status.DELETED
    //     await this.connection.getRepository(ctx, EmailTemplate).save(template)
    //     return {
    //         result: DeletionResult.DELETED,
    //     }
    // }

    // /**
    //  * Hard deletes an email template.
    //  *
    //  * @param ctx - The RequestContext containing information about the request.
    //  * @param id - The ID of the email template to be hard deleted.
    //  * @returns A Promise that resolves to a DeletionResponse.
    //  */
    // async hardDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
    //     const template = await this.connection.getEntityOrThrow(
    //         ctx,
    //         EmailTemplate,
    //         id,
    //         {},
    //     )
    //     if (template.status === Status.DELETED) {
    //         await this.connection
    //             .getRepository(ctx, EmailTemplate)
    //             .delete(template.id)
    //         await this.channelService.removeFromChannels(
    //             ctx,
    //             EmailTemplate,
    //             id,
    //             [ctx.channelId],
    //         )

    //         return {
    //             result: DeletionResult.DELETED,
    //         }
    //     }
    //     return {
    //         result: DeletionResult.NOT_DELETED,
    //     }
    // }

    /**
     * Publishes an email template.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email template to be published.
     * @returns A Promise that resolves to the published email template.
     */
    async publish(ctx: RequestContext, id: ID): Promise<EmailTemplate> {
        let template = await this.connection.getEntityOrThrow(
            ctx,
            EmailTemplate,
            id,
            {},
        )

        if (
            template.status === Status.INACTIVE ||
            template.status === Status.DELETED
        ) {
            template.deletedAt = null
            template.status = Status.ACTIVE
            template = await this.connection
                .getRepository(ctx, EmailTemplate)
                .save(template)
        }

        return template
    }

    /**
     * Unpublishes an email template.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email template to be unpublished.
     * @returns A Promise that resolves to the unpublished email template.
     */
    async unpublish(ctx: RequestContext, id: ID): Promise<EmailTemplate> {
        let template = await this.connection.getEntityOrThrow(
            ctx,
            EmailTemplate,
            id,
            {},
        )

        if (
            template.status === Status.ACTIVE ||
            template.status === Status.DELETED
        ) {
            template.deletedAt = null
            template.status = Status.INACTIVE
            template = await this.connection
                .getRepository(ctx, EmailTemplate)
                .save(template)
        }
        return template
    }
}
