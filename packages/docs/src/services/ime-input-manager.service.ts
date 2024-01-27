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

import { TextX } from '@univerjs/core';
import type { type Nullable, TextXAction } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';

import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

// Used to record all intermediate states when typing with IME,
// and then output the entire undo and redo operations.
export class IMEInputManagerService implements IDisposable {
    private _previousActiveRange: Nullable<ITextRangeWithStyle> = null;
    private _undoMutationParamsCache: IRichTextEditingMutationParams[] = [];
    private _redoMutationParamsCache: IRichTextEditingMutationParams[] = [];

    clearUndoRedoMutationParamsCache() {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
    }

    setActiveRange(range: Nullable<ITextRangeWithStyle>) {
        this._previousActiveRange = range;
    }

    pushUndoRedoMutationParams(undoParams: IRichTextEditingMutationParams, redoParams: IRichTextEditingMutationParams) {
        this._undoMutationParamsCache.push(undoParams);
        this._redoMutationParamsCache.push(redoParams);
    }

    fetchComposedUndoRedoMutationParams() {
        if (this._undoMutationParamsCache.length === 0 || this._previousActiveRange == null || this._redoMutationParamsCache.length === 0) {
            return null;
        }

        const { unitId } = this._undoMutationParamsCache[0];

        const undoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: this._undoMutationParamsCache.reverse().reduce((acc, cur) => {
                return TextX.compose(acc, cur.mutations);
            }, [] as TextXAction[]),
        };

        const redoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: this._redoMutationParamsCache.reduce((acc, cur) => {
                return TextX.compose(acc, cur.mutations);
            }, [] as TextXAction[]),
        };

        return { redoMutationParams, undoMutationParams, previousActiveRange: this._previousActiveRange };
    }

    dispose(): void {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
        this._previousActiveRange = null;
    }
}
