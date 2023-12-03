import { IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

import type { IMenuButtonItem } from '../../services/menu/menu';
import { MenuGroup, MenuItemType, MenuPosition } from '../../services/menu/menu';

export function UndoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: UndoCommand.id,
        group: MenuGroup.TOOLBAR_HISTORY,
        type: MenuItemType.BUTTON,
        icon: 'UndoSingle',
        title: 'Undo',
        tooltip: 'toolbar.undo',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.undos <= 0)),
    };
}

export function RedoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: RedoCommand.id,
        group: MenuGroup.TOOLBAR_HISTORY,
        type: MenuItemType.BUTTON,
        icon: 'RedoSingle',
        title: 'Redo',
        tooltip: 'toolbar.redo',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.redos <= 0)),
    };
}
