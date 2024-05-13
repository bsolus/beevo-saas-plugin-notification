import { LocaleString, Translatable, Translation } from '@vendure/core'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { EmailPartialType } from '../enums/email-partial.enum'
import { Status } from '../enums/status.enum'
import { EmailPartialTranslation } from './email-partial-translation.entity'
import { EmailTemplate } from './email-template.entity'
import { NotificationEntity } from './notification.entity'

@Entity()
export class EmailPartial extends NotificationEntity implements Translatable {
    /**
     * @var String              Email partial title
     */
    title: LocaleString

    /**
     * @var String              Email partial description
     */
    description: LocaleString

    /**
     * @var Text                Email partial body
     */
    body: LocaleString

    /**
     * @var EmailPartialType    Email partial type
     */
    @Column({ type: 'enum', enum: EmailPartialType })
    partialType: EmailPartialType

    /**
     * @var Status              Email partial status
     */
    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status: Status

    /**
     * @ManyToOne relation with EmailTemplate entity.
     * Represents the parent template associated with the email partial.
     */
    @ManyToOne(() => EmailTemplate, (template) => template.emailPartials)
    template: EmailTemplate

    /**
     * @OneToMany relation with EmailPartialsTranslation entity.
     * Represents translations associated with the email partial.
     */
    @OneToMany(
        (type) => EmailPartialTranslation,
        (translation) => translation.base,
        {
            eager: true,
        },
    )
    translations: Array<Translation<EmailPartial>>
}
