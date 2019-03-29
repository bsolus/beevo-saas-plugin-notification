import { ConfigService, InternalServerError } from '@vendure/core';
import dateFormat from 'dateformat';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import path from 'path';

import { EmailContext, GeneratedEmailContext } from './email-context';
import { EmailGenerator, EmailOptions } from './types';

/**
 * Uses Handlebars (https://handlebarsjs.com/) to output MJML (https://mjml.io) which is then
 * compiled down to responsive email HTML.
 */
export class HandlebarsMjmlGenerator implements EmailGenerator {
    onInit(options: EmailOptions<any>) {
        if (!options.emailTemplatePath) {
            throw new InternalServerError(
                `When using the HandlebarsMjmlGenerator, the emailTemplatePath config option must be set`,
            );
        }
        const partialsPath = path.join(options.emailTemplatePath, 'partials');
        this.registerPartials(partialsPath);
        this.registerHelpers();
    }

    generate(
        subject: string,
        template: string,
        templateContext: any,
        emailContext: EmailContext,
    ): GeneratedEmailContext {
        const compiledTemplate = Handlebars.compile(template);
        const compiledSubject = Handlebars.compile(subject);
        const subjectResult = compiledSubject(templateContext);
        const mjml = compiledTemplate(templateContext);
        const bodyResult = mjml2html(mjml);
        return new GeneratedEmailContext(emailContext, subjectResult, bodyResult.html);
    }

    private registerPartials(partialsPath: string) {
        const partialsFiles = fs.readdirSync(partialsPath);
        for (const partialFile of partialsFiles) {
            const partialContent = fs.readFileSync(path.join(partialsPath, partialFile), 'utf-8');
            Handlebars.registerPartial(path.basename(partialFile, '.hbs'), partialContent);
        }
    }

    private registerHelpers() {
        Handlebars.registerHelper('formatDate', (date: Date, format: string | object) => {
            if (typeof format !== 'string') {
                format = 'default';
            }
            return dateFormat(date, format);
        });

        Handlebars.registerHelper('formatMoney', (amount: number) => {
            return (amount / 100).toFixed(2);
        });
    }
}
