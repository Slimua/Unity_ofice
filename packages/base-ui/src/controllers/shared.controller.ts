import { Disposable, ICommandService, RedoCommand, UndoCommand } from '@univerjs/core';

import { IShortcutItem, IShortcutService } from '../services/shortcut/shorcut.service';
import { KeyCode, MetaKeys } from '../services/shortcut/keycode';

export const UndoShortcutItem: IShortcutItem = {
    id: UndoCommand.id,
    binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
};

export const RedoShortcutItem: IShortcutItem = {
    id: RedoCommand.id,
    binding: KeyCode.Y | MetaKeys.CTRL_COMMAND,
};

/**
 * Define shared UI behavior across Univer business.
 */
export class SharedController extends Disposable {
    constructor(@IShortcutService private readonly _shortcutService: IShortcutService, @ICommandService private readonly _commandService: ICommandService) {
        super();

        this.registerShortcuts();
    }

    private registerToolbarItem(): void {}

    private registerContextMenuItem(): void {}

    private registerFooterItem(): void {}

    private registerShortcuts(): void {
        [UndoShortcutItem, RedoShortcutItem].forEach((shortcut) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(shortcut));
        });
    }
}
