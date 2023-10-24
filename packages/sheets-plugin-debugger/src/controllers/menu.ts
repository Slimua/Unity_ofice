import {
    defaultTheme,
    DisplayTypes,
    greenTheme,
    IMenuSelectorItem,
    MenuItemType,
    MenuPosition,
} from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { LocaleOperation } from '../commands/operations/locale.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { UIComponentOperation } from '../commands/operations/ui-component.operation';

export function LocaleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: LocaleOperation.id,
        icon: 'ShortcutIcon',
        title: 'debugger.locale.title',
        tooltip: 'debugger.locale.tooltip',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR],
        selections: [
            {
                label: 'English',
                value: 'en',
            },
            {
                label: '简体中文',
                value: 'zh',
            },
        ],
    };
}

export function ThemeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: ThemeOperation.id,
        icon: 'ShortcutIcon',
        title: 'debugger.theme.title',
        tooltip: 'debugger.theme.tooltip',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR],
        selections: [
            {
                label: 'green',
                value: greenTheme,
            },
            {
                label: 'default',
                value: defaultTheme,
            },
        ],
    };
}
export function UIComponentMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: UIComponentOperation.id,
        icon: 'ShortcutIcon',
        title: 'debugger.uiComponent.title',
        tooltip: 'debugger.uiComponent.tooltip',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        selections: [
            {
                label: 'Notification',
                value: 'Notification Content',
            },
        ],
    };
}
