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

import type { IContextService } from '@univerjs/core';
import {
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_FORMULA_EDITOR,
    FOCUSING_SHEET,
    FOCUSING_UNIVER_EDITOR,
} from '@univerjs/core';

// TODO@wzhudev: some definition here is pretty ambiguous and not very consistent. Rename them.

/**
 * Requires the currently focused unit to be Workbook and the sheet editor is focused but not activated.
 * @param contextService
 * @returns
 */
export function whenSheetEditorFocused(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SHEET) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        !contextService.getContextValue(EDITOR_ACTIVATED)
    );
}

/**
 * Requires the currently focused unit to be Workbook and the sheet editor is activated.
 * @param contextService
 * @returns
 */
export function whenSheetEditorActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SHEET) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        contextService.getContextValue(EDITOR_ACTIVATED)
    );
}

export function whenEditorActivated(contextService: IContextService) {
    return contextService.getContextValue(EDITOR_ACTIVATED);
}

/**
 * Requires the currently focused editor is a formula editor.
 * @param contextService
 * @returns
 */
export function whenFormulaEditorFocused(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_FORMULA_EDITOR) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
    );
}

/**
 * Requires the currently focused editor is a formula editor, and it is activated.
 * @param contextService
 * @returns
 */
export function whenFormulaEditorActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SHEET) &&
        contextService.getContextValue(EDITOR_ACTIVATED) &&
        contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR)
    );
}

export function whenEditorDidNotInputFormulaActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_SHEET) &&
        contextService.getContextValue(EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA)
    );
}
