import {
    DeepPartial,
    LanguageCode,
    Translation,
    VendureEntity,
} from '@vendure/core'
import { Column, Entity, Index, ManyToOne } from 'typeorm'
import { EmailTemplate } from './email-template.entity'

@Entity()
export class EmailTemplateTranslation
    extends VendureEntity
    implements Translation<EmailTemplate>
{
    constructor(input?: DeepPartial<Translation<EmailTemplate>>) {
        super(input)
    }

    /**
     * @var LanguageCode    Email template language code
     */
    @Column({ type: 'enum', enum: LanguageCode })
    languageCode: LanguageCode

    /**
     * @var String          Email template description translation
     */
    @Column()
    description: string

    /**
     * @var Text            Email template body translation
     */
    @Column({ type: 'text' })
    body: string

    /**
     * @ManyToOne relation with EmailTemplate entity.
     * Represents the parent template associated with the translation.
     */
    @Index()
    @ManyToOne((type) => EmailTemplate, (base) => base.translations, {
        onDelete: 'CASCADE',
    })
    base: EmailTemplate
}
