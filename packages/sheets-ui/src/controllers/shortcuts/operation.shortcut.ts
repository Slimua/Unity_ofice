import { SetColHiddenCommand, SetRowHiddenCommand } from '@univerjs/sheets';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { whenEditorNotActivated } from './utils';

// export const SetUndoShortcutItem: IShortcutItem = {
//     id: UndoCommand.id,
//     // when focusing on any other input tag do not trigger this shortcut
//     preconditions: (contextService) => whenEditorNotActivated(contextService),
//     binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
// };

// export const SetRedoShortcutItem: IShortcutItem = {
//     id: RedoCommand.id,
//     // when focusing on any other input tag do not trigger this shortcut
//     preconditions: (contextService) => whenEditorNotActivated(contextService),
//     binding: KeyCode.Y | MetaKeys.CTRL_COMMAND,
// };

export const SetRowHiddenShortcutItem: IShortcutItem = {
    id: SetRowHiddenCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.Digit9 | MetaKeys.CTRL_COMMAND,
};

export const SetColHiddenShortcutItem: IShortcutItem = {
    id: SetColHiddenCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.Digit0 | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
};
