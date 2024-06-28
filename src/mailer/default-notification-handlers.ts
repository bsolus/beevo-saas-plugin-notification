/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    AccountRegistrationEvent,
    ConfigService,
    EntityHydrator,
    Fulfillment,
    FulfillmentStateTransitionEvent,
    IdentifierChangeRequestEvent,
    Injector,
    NativeAuthenticationMethod,
    Order,
    OrderStateTransitionEvent,
    PasswordResetEvent,
    RequestContext,
    ShippingLine,
} from '@vendure/core'
import { Request } from 'express'
import { EmailEventHandler } from './event-handler'

import { EmailEventListener } from './event-listener'
import {
    mockAccountRegistrationEvent,
    mockEmailAddressChangeEvent,
    mockFulfillmentStateTransitionEvent,
    mockOrderStateTransitionEvent,
    mockPasswordResetEvent,
} from './mock-events'

export const orderConfirmationHandler = new EmailEventListener(
    'order-confirmation',
)
    .on(OrderStateTransitionEvent)
    .filter(
        (event) =>
            event.toState === 'PaymentSettled' &&
            event.fromState !== 'Modifying' &&
            !!event.order.customer,
    )
    .loadData(async ({ event, injector }) => {
        transformOrderLineAssetUrls(event.ctx, event.order, injector)
        const shippingLines = await hydrateShippingLines(
            event.ctx,
            event.order,
            injector,
        )
        return { shippingLines }
    })
    .setRecipient((event) => event.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('Confirmação de encomenda: #{{ order.code }}')
    .setTemplateVars((event) => ({
        order: event.order,
        shippingLines: event.data.shippingLines,
    }))
    .setMockEvent(mockOrderStateTransitionEvent)

export const orderPartiallyShippedHandler = new EmailEventListener(
    'order-partially-shipped',
)
    .on(FulfillmentStateTransitionEvent)
    .filter((event) => event.toState === 'Shipped')
    .loadData(async ({ event, injector }) => {
        const order = injector.get(Order)
        transformOrderLineAssetUrls(event.ctx, order, injector)
        const shippingLines = await hydrateShippingLines(
            event.ctx,
            order,
            injector,
        )
        return { order, shippingLines }
    })
    .setRecipient((event) => event.data.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('Produtos enviados da sua encomenda #{{ order.code }}')
    .setTemplateVars((event) => ({
        fulfillment: event.fulfillment,
        order: event.data.order,
        shippingLines: event.data.shippingLines,
    }))
    .setMockEvent(mockFulfillmentStateTransitionEvent)

export const orderShippedHandler = new EmailEventListener('order-shipped')
    .on(OrderStateTransitionEvent)
    .filter(
        (event) =>
            event.toState === 'Shipped' &&
            event.fromState !== 'PartiallyShipped',
    )
    .loadData(async ({ event, injector }) => {
        const fulfillment = injector.get(Fulfillment)
        transformOrderLineAssetUrls(event.ctx, event.order, injector)
        const shippingLines = await hydrateShippingLines(
            event.ctx,
            event.order,
            injector,
        )
        return { fulfillment, shippingLines }
    })
    .setRecipient((event) => event.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('A sua encomenda #{{ order.code }} foi enviada')
    .setTemplateVars((event) => ({
        fulfillment: event.data.fulfillment,
        order: event.order,
        shippingLines: event.data.shippingLines,
    }))
    .setMockEvent(mockOrderStateTransitionEvent)

export const orderPartiallyDeliveredHandler = new EmailEventListener(
    'order-partially-delivered',
)
    .on(FulfillmentStateTransitionEvent)
    .filter((event) => event.toState === 'Delivered')
    .loadData(async ({ event, injector }) => {
        const order = injector.get(Order)
        transformOrderLineAssetUrls(event.ctx, order, injector)
        const shippingLines = await hydrateShippingLines(
            event.ctx,
            order,
            injector,
        )
        return { order, shippingLines }
    })
    .setRecipient((event) => event.data.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('Produtos entregues da sua encomenda #{{ order.code }}')
    .setTemplateVars((event) => ({
        fulfillment: event.fulfillment,
        order: event.data.order,
        shippingLines: event.data.shippingLines,
    }))
    .setMockEvent(mockFulfillmentStateTransitionEvent)

export const orderDeliveredHandler = new EmailEventListener('order-delivered')
    .on(OrderStateTransitionEvent)
    .filter((event) => event.toState === 'Delivered')
    .loadData(async ({ event, injector }) => {
        const fulfillment = injector.get(Fulfillment)
        transformOrderLineAssetUrls(event.ctx, event.order, injector)
        const shippingLines = await hydrateShippingLines(
            event.ctx,
            event.order,
            injector,
        )
        return { fulfillment, shippingLines }
    })
    .setRecipient((event) => event.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('A sua encomenda #{{ order.code }} foi entregue')
    .setTemplateVars((event) => ({
        fulfillment: event.data.fulfillment,
        order: event.order,
        shippingLines: event.data.shippingLines,
    }))
    .setMockEvent(mockOrderStateTransitionEvent)

export const emailVerificationHandler = new EmailEventListener(
    'email-verification',
)
    .on(AccountRegistrationEvent)
    .filter((event) => !!event.user.getNativeAuthenticationMethod().identifier)
    .filter((event) => {
        const nativeAuthMethod = event.user.authenticationMethods.find(
            (m) => m instanceof NativeAuthenticationMethod,
        ) as NativeAuthenticationMethod | undefined
        return (nativeAuthMethod && !!nativeAuthMethod.identifier) || false
    })
    .setRecipient((event) => event.user.identifier)
    .setFrom('{{ fromAddress }}')
    .setSubject('Confirme o seu e-mail')
    .setTemplateVars((event) => ({
        verificationToken:
            event.user.getNativeAuthenticationMethod().verificationToken,
    }))
    .setMockEvent(mockAccountRegistrationEvent)

export const passwordResetHandler = new EmailEventListener('password-reset')
    .on(PasswordResetEvent)
    .setRecipient((event) => event.user.identifier)
    .setFrom('{{ fromAddress }}')
    .setSubject('Reposição de palavra-passe')
    .setTemplateVars((event) => ({
        passwordResetToken:
            event.user.getNativeAuthenticationMethod().passwordResetToken,
    }))
    .setMockEvent(mockPasswordResetEvent)

export const emailAddressChangeHandler = new EmailEventListener(
    'email-address-change',
)
    .on(IdentifierChangeRequestEvent)
    .setRecipient(
        (event) =>
            event.user.getNativeAuthenticationMethod().pendingIdentifier!,
    )
    .setFrom('{{ fromAddress }}')
    .setSubject('Alteração de e-mail na conta')
    .setTemplateVars((event) => ({
        identifierChangeToken:
            event.user.getNativeAuthenticationMethod().identifierChangeToken,
    }))
    .setMockEvent(mockEmailAddressChangeEvent)

export const defaultNotificationHandlers: Array<EmailEventHandler<any, any>> = [
    orderConfirmationHandler,
    emailVerificationHandler,
    passwordResetHandler,
    emailAddressChangeHandler,
    orderPartiallyShippedHandler,
    orderShippedHandler,
    orderPartiallyDeliveredHandler,
    orderDeliveredHandler,
]

/**
 * @description
 * Applies the configured `AssetStorageStrategy.toAbsoluteUrl()` function to each of the
 * OrderLine's `featuredAsset.preview` properties, so that they can be correctly displayed
 * in the email template.
 * This is required since that step usually happens at the API in middleware, which is not
 * applicable in this context. So we need to do it manually.
 *
 * **Note: Mutates the Order object**
 *
 * @docsCategory core plugins/EmailPlugin
 * @docsPage Email utils
 */
export function transformOrderLineAssetUrls(
    ctx: RequestContext,
    order: Order,
    injector: Injector,
): Order {
    const { assetStorageStrategy } = injector.get(ConfigService).assetOptions
    if (assetStorageStrategy.toAbsoluteUrl) {
        const toAbsoluteUrl =
            assetStorageStrategy.toAbsoluteUrl.bind(assetStorageStrategy)
        for (const line of order.lines) {
            if (line.featuredAsset) {
                line.featuredAsset.preview = toAbsoluteUrl(
                    ctx.req as Request,
                    line.featuredAsset.preview,
                )
            }
        }
    }
    return order
}

/**
 * @description
 * Ensures that the ShippingLines are hydrated so that we can use the
 * `shippingMethod.name` property in the email template.
 *
 * @docsCategory core plugins/EmailPlugin
 * @docsPage Email utils
 */
export async function hydrateShippingLines(
    ctx: RequestContext,
    order: Order,
    injector: Injector,
): Promise<ShippingLine[]> {
    const shippingLines: ShippingLine[] = []
    const entityHydrator = injector.get(EntityHydrator)

    for (const line of order.shippingLines || []) {
        await entityHydrator.hydrate(ctx, line, {
            relations: ['shippingMethod'],
        })
        if (line.shippingMethod) {
            shippingLines.push(line)
        }
    }
    return shippingLines
}
