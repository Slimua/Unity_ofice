import { FOCUSING_EDITOR, FOCUSING_EDITOR_FORMULA, IContextService } from '@univerjs/core';

export function whenEditorFormulaActivated(contextService: IContextService) {
    // return contextService.getContextValue(FOCUSING_EDITOR);
    return contextService.getContextValue(FOCUSING_EDITOR) && contextService.getContextValue(FOCUSING_EDITOR_FORMULA);
}
