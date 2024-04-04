import {
    DeepPartial,
    ID,
    SoftDeletable,
    User,
    VendureEntity,
} from '@vendure/core'
import { Column, Entity, ManyToOne } from 'typeorm'

/**
 * Entity for timestamps
 */
@Entity()
export class TimestampEntity extends VendureEntity implements SoftDeletable {
    constructor(input?: DeepPartial<TimestampEntity>) {
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
