import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
    Injector,
    Logger,
    RequestContext,
    TransactionalConnection,
    TranslatorService,
} from '@vendure/core'
import fs from 'fs-extra'
import { NOTIFICATION_PLUGIN_OPTIONS, loggerCtx } from '../../constants'
import {
    EmailDetails,
    EmailTransportOptions,
    InitializedNotificationPluginOptions,
    IntermediateEmailDetails,
} from '../../types'
import { EmailTemplate } from '../entities/email-template.entity'
import { deserializeAttachments } from './attachment-utils'
import { isDevModeOptions, resolveTransportSettings } from './common'
import { EmailGenerator } from './email-generator'
import { EmailSender } from './email-sender'
import { HandlebarsMjmlGenerator } from './handlebars-mjml-generator'
import { NodemailerEmailSender } from './nodemailer-email-sender'

/**
 * Combines template loading, generation, and email sending for the NotificationPlugin.
 * This class facilitates easier testing by separating the core logic from infrastructure dependencies.
 */
@Injectable()
export class NotificationProcessor {
    protected sender: EmailSender
    protected generator: EmailGenerator

    /**
     * Initializes the NotificationProcessor.
     * @param options - Plugin options.
     * @param moduleRef - Reference to the current module.
     * @param connection - Transactional database connection.
     * @param translator - Service for translating messages.
     */
    constructor(
        @Inject(NOTIFICATION_PLUGIN_OPTIONS)
        protected options: InitializedNotificationPluginOptions,
        private moduleRef: ModuleRef,
        private connection: TransactionalConnection,
        private translator: TranslatorService,
    ) {}

    /**
     * Initializes the processor by setting up the email sender and generator.
     */
    async init() {
        const ctx = RequestContext.empty()
        this.sender = this.options.emailSender
            ? this.options.emailSender
            : new NodemailerEmailSender()
        this.generator = this.options.emailGenerator
            ? this.options.emailGenerator
            : new HandlebarsMjmlGenerator(ctx, this.connection, this.translator)

        if (this.generator.onInit) {
            await this.generator.onInit.call(this.generator, this.options)
        }

        const transport = await this.getTransportSettings()
        if (transport.type === 'file') {
            const emailPath = transport.outputPath
            await fs.ensureDir(emailPath)
        }
    }

    /**
     * Processes an email based on the provided details.
     * @param data - Intermediate email details.
     * @returns A promise that resolves to `true` if the email was sent successfully.
     */
    async process(data: IntermediateEmailDetails): Promise<boolean> {
        try {
            const ctx = RequestContext.deserialize(data.ctx)
            const template = await this.connection
                .getRepository(ctx, EmailTemplate)
                .findOneBy({
                    title: data.type,
                })

            if (!template) {
                throw new Error('Could not find email template in DB')
            }

            const bodySource = this.translator.translate(template, ctx).body
            const generated = await this.generator.generate(
                data.from,
                data.subject,
                bodySource,
                data.templateVars,
            )

            const emailDetails: EmailDetails = {
                ...generated,
                recipient: data.recipient,
                attachments: deserializeAttachments(data.attachments),
                cc: data.cc,
                bcc: data.bcc,
                replyTo: data.replyTo,
            }

            const transportSettings = await this.getTransportSettings(ctx)
            await this.sender.send(emailDetails, transportSettings)
            return true
        } catch (err: unknown) {
            if (err instanceof Error) {
                Logger.error(err.message, loggerCtx, err.stack)
            } else {
                Logger.error(String(err), loggerCtx)
            }
            throw err
        }
    }

    /**
     * Retrieves the email transport settings based on the plugin configuration.
     * @param ctx - Optional request context.
     * @returns A promise that resolves to the email transport options.
     */
    async getTransportSettings(
        ctx?: RequestContext,
    ): Promise<EmailTransportOptions> {
        const transport = await resolveTransportSettings(
            this.options,
            new Injector(this.moduleRef),
            ctx,
        )

        if (isDevModeOptions(this.options)) {
            if (transport && transport.type !== 'file') {
                Logger.warn(
                    `The NotificationPlugin is running in dev mode. The configured '${transport.type}' transport will be replaced by the 'file' transport.`,
                    loggerCtx,
                )
            }
            return {
                type: 'file',
                raw: false,
                outputPath: this.options.outputPath,
            }
        } else {
            return transport
        }
    }
}
