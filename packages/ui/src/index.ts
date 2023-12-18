/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export * from './BaseComponent';
export * from './common';
export * from './components';
export { useObservable } from './components/hooks/observable';
export {
    CopyShortcutItem,
    CutShortcutItem,
    PasteShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from './controllers/shared-shortcut.controller';
export { IUIController } from './controllers/ui/ui.controller';
export { DesktopUIPart, type IDesktopUIController } from './controllers/ui/ui-desktop.controller';
export { enUS, zhCN } from './locale';
export { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
export { CopyCommand, CutCommand, PasteCommand } from './services/clipboard/clipboard.command';
export {
    BrowserClipboardService,
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from './services/clipboard/clipboard-interface.service';
export { IConfirmService } from './services/confirm/confirm.service';
export { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
export {
    DesktopContextMenuService,
    type IContextMenuHandler,
    IContextMenuService,
} from './services/contextmenu/contextmenu.service';
export { DesktopDialogService } from './services/dialog/desktop-dialog.service';
export { IDialogService } from './services/dialog/dialog.service';
export { LayoutService } from './services/layout/layout.service';
export {
    type ICustomComponentProps,
    type IDisplayMenuItem,
    type IMenuButtonItem,
    type IMenuItem,
    type IMenuItemFactory,
    type IMenuSelectorItem,
    type IValueOption,
    MenuGroup,
    MenuItemType,
    MenuPosition,
} from './services/menu/menu';
export { DesktopMenuService, IMenuService } from './services/menu/menu.service';
export { DesktopMessageService } from './services/message/desktop-message.service';
export { IMessageService } from './services/message/message.service';
export { DesktopNotificationService } from './services/notification/desktop-notification.service';
export { INotificationService } from './services/notification/notification.service';
export { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
export { KeyCode, MetaKeys } from './services/shortcut/keycode';
export { DesktopShortcutService, type IShortcutItem, IShortcutService } from './services/shortcut/shortcut.service';
export { ShortcutExperienceService } from './services/shortcut/shortcut-experience.service';
export { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
export { ISidebarService } from './services/sidebar/sidebar.service';
export { IZenZoneService } from './services/zen-zone/zen-zone.service';
export { UniverUIPlugin } from './ui-plugin';
export * from './utils';
export { type IConfirmPartMethodOptions } from './views/components/confirm-part/interface';
