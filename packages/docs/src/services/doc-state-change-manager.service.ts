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

import type { JSONXActions, Nullable } from '@univerjs/core';
import { ICommandService, IUndoRedoService, IUniverInstanceService, JSONX, RedoCommandId, RxDisposable, UndoCommandId } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

interface IDocChangeState {
    actions: JSONXActions;
    textRanges: Nullable<ITextRangeWithStyle[]>;
}

type ChangeStateCacheType = 'history' | 'collaboration';

export interface IDocStateChangeParams {
    commandId: string;
    unitId: string;
    trigger: Nullable<string>;
    redoState: IDocChangeState;
    undoState: IDocChangeState;
    segmentId?: string;
    noHistory?: boolean;
    debounce?: boolean;
}

const DEBOUNCE_DELAY = 300;

// This class sends out state-changing events, what is the state, the data model,
// and the cursor & selection, and this class mainly serves the History(undo/redo) module and
// the collaboration module.
export class DocStateChangeManagerService extends RxDisposable {
    private readonly _docStateChange$ = new BehaviorSubject<Nullable<IDocStateChangeParams>>(null);
    readonly docStateChange$ = this._docStateChange$.asObservable();
    // This cache used for history compose.
    private _historyStateCache: Map<string, IDocStateChangeParams[]> = new Map();
    // This cache used for collaboration state compose.
    private _changeStateCache: Map<string, IDocStateChangeParams[]> = new Map();
    private _historyTimer: Nullable<ReturnType<typeof setTimeout>> = null;
    private _changeStateCacheTimer: Nullable<ReturnType<typeof setTimeout>> = null;

    constructor(
        @Inject(IUndoRedoService) private _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initialize();
    }

    setChangeState(changeState: IDocStateChangeParams) {
        this._cacheChangeState(changeState, 'history');
        // Mutations by user or historyService need collaboration.
        this._cacheChangeState(changeState, 'collaboration');
    }

    private _initialize() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command) => {
                if (command.id === UndoCommandId || command.id === RedoCommandId) {
                    const univerDoc = this._univerInstanceService.getCurrentUniverDocInstance();
                    if (univerDoc == null) {
                        return;
                    }

                    const unitId = univerDoc.getUnitId();

                    this._pushHistory(unitId);
                    this._emitChangeState(unitId);
                }
            })
        );
    }

    private _cacheChangeState(changeState: IDocStateChangeParams, type: ChangeStateCacheType = 'history') {
        const { trigger, unitId, noHistory, debounce = false } = changeState;

        if (noHistory || trigger == null) {
            return;
        }

        if (type === 'history' && (trigger === RedoCommandId || trigger === UndoCommandId)) {
            return;
        }

        const stateCache = type === 'history'
            ? this._historyStateCache
            : this._changeStateCache;

        const cb = type === 'history'
            ? this._pushHistory.bind(this)
            : this._emitChangeState.bind(this);

        if (stateCache.has(unitId)) {
            const cacheStates = stateCache.get(unitId);

            cacheStates?.push(changeState);
        } else {
            stateCache.set(unitId, [changeState]);
        }

        if (debounce) {
            if (type === 'history') {
                if (this._historyTimer) {
                    clearTimeout(this._historyTimer);
                }

                this._historyTimer = setTimeout(() => {
                    cb(unitId);
                }, DEBOUNCE_DELAY);
            } else {
                if (this._changeStateCacheTimer) {
                    clearTimeout(this._changeStateCacheTimer);
                }

                this._changeStateCacheTimer = setTimeout(() => {
                    cb(unitId);
                }, DEBOUNCE_DELAY);
            }
        } else {
            cb(unitId);
        }
    }

    private _pushHistory(unitId: string) {
        const undoRedoService = this._undoRedoService;
        const cacheStates = this._historyStateCache.get(unitId);

        if (!Array.isArray(cacheStates) || cacheStates.length === 0) {
            return;
        }

        const len = cacheStates.length;
        // Use the first state.commandId as commandId, because we will only have one core mutation type.
        const commandId = cacheStates[0].commandId;

        const firstState = cacheStates[0];
        const lastState = cacheStates[len - 1];

        const redoParams: IRichTextEditingMutationParams = {
            unitId,
            actions: cacheStates.reduce((acc, cur) => JSONX.compose(acc, cur.redoState.actions), null as JSONXActions),
            textRanges: lastState.redoState.textRanges,
        };

        const undoParams: IRichTextEditingMutationParams = {
            unitId,
            // Always need to put undoParams after redoParams, because `reverse` will change the `cacheStates` order.
            actions: cacheStates.reverse().reduce((acc, cur) => JSONX.compose(acc, cur.undoState.actions), null as JSONXActions),
            textRanges: firstState.undoState.textRanges,
        };

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: [{ id: commandId, params: undoParams }],
            redoMutations: [{ id: commandId, params: redoParams }],
        });

        // Empty the cacheState.
        cacheStates.length = 0;
    }

    private _emitChangeState(unitId: string) {
        const cacheStates = this._changeStateCache.get(unitId);

        if (!Array.isArray(cacheStates) || cacheStates.length === 0) {
            return;
        }

        const len = cacheStates.length;
        // Use the first state.commandId as commandId, because we will only have one core mutation type.
        const { commandId, trigger, segmentId, noHistory, debounce } = cacheStates[0];

        const firstState = cacheStates[0];
        const lastState = cacheStates[len - 1];

        const redoState: IRichTextEditingMutationParams = {
            unitId,
            actions: cacheStates.reduce((acc, cur) => JSONX.compose(acc, cur.redoState.actions), null as JSONXActions),
            textRanges: lastState.redoState.textRanges,
        };

        const undoState: IRichTextEditingMutationParams = {
            unitId,
            // Always need to put undoParams after redoParams, because `reverse` will change the `cacheStates` order.
            actions: cacheStates.reverse().reduce((acc, cur) => JSONX.compose(acc, cur.undoState.actions), null as JSONXActions),
            textRanges: firstState.undoState.textRanges,
        };

        const changeState: IDocStateChangeParams = {
            commandId,
            unitId,
            trigger,
            redoState,
            undoState,
            segmentId,
            noHistory,
            debounce,
        };

        // Empty the cacheState.
        cacheStates.length = 0;

        this._docStateChange$.next(changeState);
    }
}
