import { EmailGenerator } from './email-generator'

/**
 * Simply passes through the subject and template content without modification.
 */
export class NoopEmailGenerator implements EmailGenerator {
    async generate(from: string, subject: string, body: string) {
        return { from, subject, body }
    }
}
