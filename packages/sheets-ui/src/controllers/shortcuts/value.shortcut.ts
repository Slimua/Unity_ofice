import { ClearSelectionContentCommand } from '@univerjs/sheets';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode } from '@univerjs/ui';

import { whenEditorNotActivated } from './utils';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.DELETE,
    mac: KeyCode.BACKSPACE,
};
