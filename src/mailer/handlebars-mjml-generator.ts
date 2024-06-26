import {
    RequestContext,
    TransactionalConnection,
    TranslatorService,
} from '@vendure/core'
import dateFormat from 'dateformat'
import Handlebars from 'handlebars'
import mjml2html from 'mjml'
import { EmailPartial } from '../entities/email-partial.entity'
import { EmailGenerator } from './email-generator'

/**
 * @description
 * Uses Handlebars (https://handlebarsjs.com/) to output MJML (https://mjml.io) which is then
 * compiled down to responsive email HTML.
 *
 * @docsCategory core plugins/EmailPlugin
 * @docsPage EmailGenerator
 */
export class HandlebarsMjmlGenerator implements EmailGenerator {
    constructor(
        private ctx: RequestContext,
        private connection: TransactionalConnection,
        private translator: TranslatorService,
    ) {}

    async onInit() {
        await this.registerPartials()
        this.registerHelpers()
    }

    async generate(
        from: string,
        subject: string,
        template: string,
        templateVars: any,
    ) {
        await this.registerPartials()
        const compiledFrom = Handlebars.compile(from, { noEscape: true })
        const compiledSubject = Handlebars.compile(subject)
        const compiledTemplate = Handlebars.compile(template)
        // We enable prototype properties here, aware of the security implications
        // described here: https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access
        // This is needed because some Vendure entities use getters on the entity
        // prototype (e.g. Order.total) which may need to be interpolated.
        const templateOptions: RuntimeOptions = {
            allowProtoPropertiesByDefault: true,
        }
        const fromResult = compiledFrom(templateVars, {
            allowProtoPropertiesByDefault: true,
        })
        const subjectResult = compiledSubject(templateVars, {
            allowProtoPropertiesByDefault: true,
        })
        const mjml = compiledTemplate(templateVars, {
            allowProtoPropertiesByDefault: true,
        })
        const body = mjml2html(mjml).html
        return { from: fromResult, subject: subjectResult, body }
    }

    private registerHelpers() {
        Handlebars.registerHelper(
            'formatDate',
            (date: Date | undefined, format: string | object) => {
                if (!date) {
                    return date
                }
                if (typeof format !== 'string') {
                    format = 'default'
                }
                return dateFormat(date, format)
            },
        )

        Handlebars.registerHelper('formatMoney', (amount?: number) => {
            if (amount == null) {
                return amount
            }
            return (amount / 100).toFixed(2)
        })
    }

    async registerPartials() {
        const rawPartials = await this.connection
            .getRepository(this.ctx, EmailPartial)
            .find()

        rawPartials.forEach((partial) => {
            const partials = this.translator.translate(partial, this.ctx)
            Handlebars.unregisterPartial(partials.title)
        })

        rawPartials.forEach((partial) => {
            const partials = this.translator.translate(partial, this.ctx)
            Handlebars.registerPartial(partials.title, partials.body)
        })
    }
}
