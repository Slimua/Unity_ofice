import { FOCUSING_EDITOR, FOCUSING_EDITOR_BUT_HIDDEN, FOCUSING_SHEET, IContextService } from '@univerjs/core';

export function whenEditorNotActivated(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_EDITOR);
}

export function whenEditorFocusIsHidden(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN) && !contextService.getContextValue(FOCUSING_EDITOR)
    );
}

export function whenEditorActivatedIsVisible(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_EDITOR) && contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN)
    );
}
