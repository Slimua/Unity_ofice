import { PASTE_SPECIAL_MENU_ID } from '@univerjs/sheets-ui';
import type { IMenuItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';

export function InsertFunctionMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertFunctionOperation.id,
        icon: 'FunctionSingle',
        tooltip: 'formula.insert.tooltip',
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: 'SUM',
                value: 'SUM',
                icon: 'SumSingle',
            },
            {
                label: 'AVERAGE',
                value: 'AVERAGE',
                icon: 'AvgSingle',
            },
            {
                label: 'COUNT',
                value: 'COUNT',
                icon: 'CntSingle',
            },
            {
                label: 'MAX',
                value: 'MAX',
                icon: 'MaxSingle',
            },
            {
                label: 'MIN',
                value: 'MIN',
                icon: 'MinSingle',
            },
        ],
    };
}

export function MoreFunctionsMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: MoreFunctionsOperation.id,
        title: 'formula.insert.more',
        positions: InsertFunctionOperation.id,
        type: MenuItemType.BUTTON,
    };
}

export function PasteFormulaMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetOnlyPasteFormulaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'formula.operation.pasteFormula',
        positions: [PASTE_SPECIAL_MENU_ID],
    };
}
