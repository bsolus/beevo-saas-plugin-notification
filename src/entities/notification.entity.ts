import {
    DeepPartial,
    ID,
    SoftDeletable,
    User,
    VendureEntity,
} from '@vendure/core'
import { Column, Entity, ManyToOne } from 'typeorm'

/**
 * Entity for notification plugin
 */
@Entity()
export class NotificationEntity extends VendureEntity implements SoftDeletable {
    constructor(input?: DeepPartial<NotificationEntity>) {
        super(input)
    }

    /**
     * @var Date deletedAt  Deleted date
     */
    @Column({ type: 'date', nullable: true })
    deletedAt: Date | null

    /**
     * @var User createdBy  User who create
     */
    @ManyToOne((type) => User, { nullable: false })
    createdBy: ID

    /**
     * @var User updatedBy  User who update
     */
    @ManyToOne((type) => User, { nullable: true })
    updatedBy: ID
}
