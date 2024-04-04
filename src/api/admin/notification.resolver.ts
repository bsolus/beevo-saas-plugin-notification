import { Args, Mutation, Resolver } from '@nestjs/graphql'
import {
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RequestContext,
    Transaction,
} from '@vendure/core'

import { EmailPartial } from '../../entities/email-partial.entity'
import { EmailTemplate } from '../../entities/email-template.entity'
import { EmailPartialService } from '../../services/email-partial.service'
import { EmailTemplateService } from '../../services/email-template.service'

// TODO: Set up graphql-code-generator to generate the types for the following inputs
type CreateEmailTemplateInput = any
type CreateEmailPartialInput = any
type UpdateEmailTemplateInput = any
type UpdateEmailPartialInput = any

@Resolver()
export class AdminNotificationResolver {
    constructor(
        private emailTemplateService: EmailTemplateService,
        private emailPartialService: EmailPartialService,
    ) {}

    /**
     * Creates a new email template within a transaction
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the input data (CreateEmailTemplateInput).
     * @returns A Promise that resolves to the newly created EmailTemplate entity.
     */
    @Transaction()
    @Mutation()
    createEmailTemplate(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateEmailTemplateInput },
    ): Promise<EmailTemplate> {
        return this.emailTemplateService.create(ctx, args.input)
    }

    /**
     * Updates an existing email template within a transaction
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the input data (UpdateEmailTemplateInput).
     * @returns A Promise that resolves to the updated EmailTemplate entity or undefined if not found.
     */
    @Transaction()
    @Mutation()
    updateEmailTemplate(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateEmailTemplateInput },
    ): Promise<EmailTemplate | undefined> {
        return this.emailTemplateService.update(ctx, args.input)
    }

    /**
     * Lists email templates based on the provided ListQueryOptions within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the options for the list query.
     * @returns A Promise that resolves to a PaginatedList of email templates.
     */
    @Mutation()
    listEmailTemplates(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<EmailTemplate> },
    ): Promise<PaginatedList<EmailTemplate>> {
        return this.emailTemplateService.findAll(ctx, args.options || undefined)
    }

    // /**
    //  * Performs a soft delete on an email template within a transaction.
    //  *
    //  * @param ctx - The RequestContext containing information about the request.
    //  * @param args - The arguments containing the ID of the email template to be soft-deleted.
    //  * @returns A Promise that resolves to a DeletionResponse indicating the result of the soft delete operation.
    //  */
    // @Mutation()
    // @Transaction()
    // softDeleteEmailTemplate(
    //     @Ctx() ctx: RequestContext,
    //     @Args() args: { id: string },
    // ): Promise<DeletionResponse> {
    //     return this.emailTemplateService.softDelete(ctx, args.id)
    // }

    // /**
    //  * Performs a hard delete on an email template within a transaction.
    //  *
    //  * @param ctx - The RequestContext containing information about the request.
    //  * @param args - The arguments containing the ID of the email template to be hard-deleted.
    //  * @returns A Promise that resolves to a DeletionResponse indicating the result of the hard delete operation.
    //  */
    // @Mutation()
    // @Transaction()
    // hardDeleteEmailTemplate(
    //     @Ctx() ctx: RequestContext,
    //     @Args() args: { id: string },
    // ): Promise<DeletionResponse> {
    //     return this.emailTemplateService.hardDelete(ctx, args.id)
    // }

    /**
     * Publishes an email template within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the ID of the email template to be published.
     * @returns A Promise that resolves to the published EmailTemplate entity.
     */
    @Mutation()
    publishEmailTemplate(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string },
    ): Promise<EmailTemplate> {
        return this.emailTemplateService.publish(ctx, args.id)
    }

    /**
     * Unpublishes an email template within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the ID of the email template to be unpublished.
     * @returns A Promise that resolves to the unpublished EmailTemplate entity.
     */
    @Mutation()
    unpublishEmailTemplate(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string },
    ): Promise<EmailTemplate> {
        return this.emailTemplateService.unpublish(ctx, args.id)
    }

    /**
     * Creates a new email partial within a transaction
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the input data (CreateEmailPartialInput).
     * @returns A Promise that resolves to the newly created EmailPartial entity.
     */
    @Transaction()
    @Mutation()
    createEmailPartial(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateEmailPartialInput },
    ): Promise<EmailPartial> {
        return this.emailPartialService.create(ctx, args.input)
    }

    /**
     * Updates an existing email partial within a transaction
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the input data (UpdateEmailPartialInput).
     * @returns A Promise that resolves to the updated EmailPartial entity or undefined if not found.
     */
    @Transaction()
    @Mutation()
    updateEmailPartial(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateEmailPartialInput },
    ): Promise<EmailPartial | undefined> {
        return this.emailPartialService.update(ctx, args.input)
    }

    /**
     * Lists email partials based on the provided ListQueryOptions within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param args - The arguments containing the options for the list query.
     * @returns A Promise that resolves to a PaginatedList of email partials.
     */
    @Mutation()
    listEmailPartials(
        @Ctx() ctx: RequestContext,
        @Args()
        args: {
            options: ListQueryOptions<EmailPartial>
            templateId?: ID
        },
    ): Promise<PaginatedList<EmailPartial>> {
        return this.emailPartialService.findAll(
            ctx,
            args.options || undefined,
            undefined,
            args.templateId,
        )
    }

    // /**
    //  * Performs a hard delete on an email partial within a transaction.
    //  *
    //  * @param ctx - The RequestContext containing information about the request.
    //  * @param args - The arguments containing the ID of the email partial to be hard-deleted.
    //  * @returns A Promise that resolves to a DeletionResponse indicating the result of the hard delete operation.
    //  */
    // @Mutation()
    // @Transaction()
    // hardDeleteEmailPartial(
    //     @Ctx() ctx: RequestContext,
    //     @Args() args: { id: string },
    // ): Promise<DeletionResponse> {
    //     return this.emailPartialService.hardDelete(ctx, args.id)
    // }
}
