import {
    DeepPartial,
    LanguageCode,
    Translation,
    VendureEntity,
} from '@vendure/core'
import { Column, Entity, Index, ManyToOne } from 'typeorm'
import { EmailPartial } from './email-partial.entity'

@Entity()
export class EmailPartialTranslation
    extends VendureEntity
    implements Translation<EmailPartial>
{
    constructor(input?: DeepPartial<Translation<EmailPartial>>) {
        super(input)
    }

    /**
     * @var LanguageCode    Email partial language code
     */
    @Column({ type: 'enum', enum: LanguageCode })
    languageCode: LanguageCode

    /**
     * @var String          Email partial title translation
     */
    @Column()
    title: string

    /**
     * @var String          Email partial description translation
     */
    @Column()
    description: string

    /**
     * @var Text            Email partial body translation
     */
    @Column({ type: 'text' })
    body: string

    /**
     * @ManyToOne relation with EmailPartial entity.
     * Represents the parent email partial associated with the translation.
     */
    @Index()
    @ManyToOne((type) => EmailPartial, (base) => base.translations, {
        onDelete: 'CASCADE',
    })
    base: EmailPartial
}
