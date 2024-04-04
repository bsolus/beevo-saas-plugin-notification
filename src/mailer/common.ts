import { Injector, RequestContext } from '@vendure/core'

import {
    EmailTransportOptions,
    NotificationPluginDevModeOptions,
    NotificationPluginOptions,
} from '../../types'

export function isDevModeOptions(
    input: NotificationPluginOptions | NotificationPluginDevModeOptions,
): input is NotificationPluginDevModeOptions {
    return (input as NotificationPluginDevModeOptions).devMode === true
}

export async function resolveTransportSettings(
    options: NotificationPluginOptions,
    injector: Injector,
    ctx?: RequestContext,
): Promise<EmailTransportOptions> {
    if (typeof options.transport === 'function') {
        return options.transport(injector, ctx)
    } else {
        return options.transport
    }
}
