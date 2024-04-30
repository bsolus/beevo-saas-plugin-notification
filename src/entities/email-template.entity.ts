import {
    Channel,
    ChannelAware,
    LocaleString,
    Translatable,
    Translation,
} from '@vendure/core'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { Status } from '../enums/status.enum'
import { EmailPartial } from './email-partial.entity'
import { EmailTemplateTranslation } from './email-template-translation.entity'
import { TimestampEntity } from './timestamp.entity'

@Entity()
export class EmailTemplate
    extends TimestampEntity
    implements ChannelAware, Translatable
{
    /**
     * @var String  Email template title
     */
    @Column()
    title: string

    /**
     * @var String  Email template description
     */
    description: LocaleString

    /**
     * @var String  Email template body
     */
    body: LocaleString

    /**
     * @var Status  Email template status
     */
    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status: Status

    /**
     * @OneToMany relation with EmailTemplateTranslation entity.
     * Represents translations associated with the template.
     */
    @OneToMany(
        (type) => EmailTemplateTranslation,
        (translation) => translation.base,
        {
            eager: true,
        },
    )
    translations: Array<Translation<EmailTemplate>>

    /**
     * @OneToMany relation with EmailPartial entity.
     * Represents email partials associated with the template.
     */
    @OneToMany(() => EmailPartial, (emailPartials) => emailPartials.template)
    emailPartials: Array<EmailPartial>

    /**
     * @ManyToMany relation with Channel entity.
     * Represents channels associated with the template.
     */
    @ManyToMany((type) => Channel)
    @JoinTable()
    channels: Channel[]
}
