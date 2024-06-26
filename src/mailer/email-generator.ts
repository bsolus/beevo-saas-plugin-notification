import { InjectableStrategy, VendureEvent } from '@vendure/core'

import { EmailDetails, NotificationPluginOptions } from '../../types'

/**
 * @description
 * An EmailGenerator generates the subject and body details of an email.
 *
 * @docsCategory core plugins/EmailPlugin
 * @docsPage EmailGenerator
 * @docsWeight 0
 */
export interface EmailGenerator<
    T extends string = any,
    E extends VendureEvent = any,
> extends InjectableStrategy {
    /**
     * @description
     * Any necessary setup can be performed here.
     */
    onInit?(options: NotificationPluginOptions): void | Promise<void>

    /**
     * @description
     * Given a subject and body from an email template, this method generates the final
     * interpolated email text.
     */
    generate(
        from: string,
        subject: string,
        body: string,
        templateVars: { [key: string]: any },
    ): Promise<Pick<EmailDetails, 'from' | 'subject' | 'body'>>
}
