import { CrudPermissionDefinition } from '@vendure/core'

export const NOTIFICATION_PLUGIN_OPTIONS = Symbol('NOTIFICATION_PLUGIN_OPTIONS')
export const loggerCtx = 'NotificationPlugin'
export const emailTemplatePermission = new CrudPermissionDefinition(
    'EmailTemplate',
)
export const emailPartialPermission = new CrudPermissionDefinition(
    'EmailPartial',
)
