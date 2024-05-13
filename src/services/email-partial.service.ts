import { Injectable } from '@nestjs/common'
import {
    DeletionResponse,
    DeletionResult,
} from '@vendure/common/lib/generated-types'
import {
    ID,
    ListQueryBuilder,
    ListQueryOptions,
    PaginatedList,
    RequestContext,
    TransactionalConnection,
    TranslatableSaver,
    TranslatorService,
} from '@vendure/core'
import { EmailPartialTranslation } from '../entities/email-partial-translation.entity'
import { EmailPartial } from '../entities/email-partial.entity'
import { EmailPartialType } from '../enums/email-partial.enum'
import { Status } from '../enums/status.enum'

// TODO: Set up graphql-code-generator to generate the types for the following inputs
type CreateEmailPartialInput = any
type UpdateEmailPartialInput = any

@Injectable()
export class EmailPartialService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private translator: TranslatorService,
        private translatableSaver: TranslatableSaver,
    ) {}

    /**
     * Retrieves a paginated list of all email partials based on the provided ListQueryOptions within the RequestContext.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param options - The options for the list query, specifying filters, sorting, and pagination.
     * @returns A Promise that resolves to a PaginatedList of email partials.
     */
    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<EmailPartial>,
        partialType?: EmailPartialType,
        templateId?: ID,
    ): Promise<PaginatedList<EmailPartial>> {
        const builder = this.listQueryBuilder.build(EmailPartial, options, {
            ctx,
        })

        if (templateId) {
            builder
                .leftJoin('emailPartials.template', 'template')
                .where('template.id = :templateId', {
                    templateId,
                })
        }

        if (partialType) {
            builder.where('partialType = :partialType', {
                partialType,
            })
        }

        return builder
            .getManyAndCount()
            .then(async ([emailPartialItems, totalItems]) => {
                const items = emailPartialItems.map((template) =>
                    this.translator.translate(template, ctx),
                )
                return {
                    items,
                    totalItems,
                }
            })
    }

    /**
     * Retrieves a specific email partial based on its ID within the RequestContext.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email partial to be retrieved.
     * @returns A Promise that resolves to the specified email partial.
     */
    async findOne(
        ctx: RequestContext,
        id: string,
    ): Promise<EmailPartial | undefined> {
        const partial = await this.findOne(ctx, id)
        if (!partial) {
            return
        }
        return this.translator.translate(partial, ctx)
    }

    /**
     * Creates a new email partial over the provided RequestContext and CreateEmailPartialInput.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param input - The input data to create the new email partial entity.
     * @returns A Promise that resolves to the newly created email partial entity.
     */
    async create(
        ctx: RequestContext,
        input: CreateEmailPartialInput,
    ): Promise<EmailPartial> {
        input['createdBy'] = ctx.activeUserId

        const partial = await this.translatableSaver.create({
            ctx,
            input,
            entityType: EmailPartial,
            translationType: EmailPartialTranslation,
            beforeSave: async (partial) => {
                partial.template = { id: input.templateId } as any
            },
        })

        return this.connection.getRepository(ctx, EmailPartial).save(partial)
    }

    /**
     * Updates an email partial within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param input - The input containing the ID and updated data for the email partial.
     * @returns A Promise that resolves to the updated email partial entity.
     */
    async update(
        ctx: RequestContext,
        input: UpdateEmailPartialInput,
    ): Promise<EmailPartial> {
        const partial = await this.connection.getEntityOrThrow(
            ctx,
            EmailPartial,
            input.id,
        )

        const updated = { ...partial, ...input }
        updated['updatedBy'] = ctx.activeUserId

        const updatedPartial = await this.translatableSaver.update({
            ctx,
            input: updated,
            entityType: EmailPartial,
            translationType: EmailPartialTranslation,
        })

        return this.connection
            .getRepository(ctx, EmailPartial)
            .save(updatedPartial)
    }

    /**
     * Performs a soft delete on an email partial within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email partial to be soft deleted.
     * @returns A Promise that resolves to a DeletionResponse.
     */
    async softDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const partial = await this.connection.getEntityOrThrow(
            ctx,
            EmailPartial,
            id,
            {},
        )

        partial.status = Status.DELETED
        await this.connection.getRepository(ctx, EmailPartial).save(partial)
        return {
            result: DeletionResult.DELETED,
        }
    }

    /**
     * Performs a hard delete on an email partial within a transaction.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email partial to be hard-deleted.
     * @returns A Promise that resolves to a DeletionResponse indicating the result of the hard delete operation.
     */
    async hardDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const partial = await this.connection.getEntityOrThrow(
            ctx,
            EmailPartial,
            id,
            {},
        )
        await this.connection
            .getRepository(ctx, EmailPartial)
            .delete(partial.id)
        return {
            result: DeletionResult.DELETED,
        }
    }

    /**
     * Publishes an email partial.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email partial to be published.
     * @returns A Promise that resolves to the published email partial.
     */
    async publish(ctx: RequestContext, id: ID): Promise<EmailPartial> {
        let partial = await this.connection.getEntityOrThrow(
            ctx,
            EmailPartial,
            id,
            {},
        )

        if (
            partial.status === Status.INACTIVE ||
            partial.status === Status.DELETED
        ) {
            partial.deletedAt = null
            partial.status = Status.ACTIVE
            partial = await this.connection
                .getRepository(ctx, EmailPartial)
                .save(partial)
        }

        return partial
    }

    /**
     * Unpublishes an email partial.
     *
     * @param ctx - The RequestContext containing information about the request.
     * @param id - The ID of the email partial to be unpublished.
     * @returns A Promise that resolves to the unpublished email partial.
     */
    async unpublish(ctx: RequestContext, id: ID): Promise<EmailPartial> {
        let partial = await this.connection.getEntityOrThrow(
            ctx,
            EmailPartial,
            id,
            {},
        )

        if (
            partial.status === Status.ACTIVE ||
            partial.status === Status.DELETED
        ) {
            partial.deletedAt = null
            partial.status = Status.INACTIVE
            partial = await this.connection
                .getRepository(ctx, EmailPartial)
                .save(partial)
        }
        return partial
    }
}
