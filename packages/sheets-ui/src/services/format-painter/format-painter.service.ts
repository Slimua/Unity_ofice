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

import type { IRange, IStyleData } from '@univerjs/core';
import { Disposable, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { SelectionManagerService, SetRangeValuesMutation } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { IMarkSelectionService } from '../mark-selection/mark-selection.service';

export interface IFormatPainterService {
    status$: Observable<FormatPainterStatus>;
    addHook(hooks: IFormatPainterHook): void;
    getHooks(): IFormatPainterHook[];
    setStatus(status: FormatPainterStatus): void;
    getStatus(): FormatPainterStatus;
    setSelectionFormat(format: ISelectionFormatInfo): void;
    getSelectionFormat(): ISelectionFormatInfo;
}

export interface ISelectionFormatInfo {
    styles: ObjectMatrix<IStyleData>;
    merges: IRange[];
}

export interface IFormatPainterHook {
    id: string;
    isDefaultHook?: boolean;
    priority?: number;
    onStatusChange(status: FormatPainterStatus): void;
    onApply(range: IRange, format: ISelectionFormatInfo): void;
}
export enum FormatPainterStatus {
    OFF,
    ONCE,
    INFINITE,
}

export const IFormatPainterService = createIdentifier<IFormatPainterService>('univer.format-painter-service');

export class FormatPainterService extends Disposable implements IFormatPainterService {
    readonly status$: Observable<FormatPainterStatus>;
    private _selectionFormat: ISelectionFormatInfo;
    private _markId: string | null = null;
    private readonly _status$: BehaviorSubject<FormatPainterStatus>;
    private _defaultHook: IFormatPainterHook | null = null;
    private _extendHooks: IFormatPainterHook[] = [];

    constructor(
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMarkSelectionService private readonly _markSelectionService: IMarkSelectionService
    ) {
        super();

        this._status$ = new BehaviorSubject<FormatPainterStatus>(FormatPainterStatus.OFF);
        this.status$ = this._status$.asObservable();
        this._selectionFormat = { styles: new ObjectMatrix<IStyleData>(), merges: [] };
    }

    addHook(hook: IFormatPainterHook) {
        if (hook.isDefaultHook && (hook.priority ?? 0) > (this._defaultHook?.priority ?? -1)) {
            this._defaultHook = hook;
        } else {
            this._extendHooks.push(hook);
            this._extendHooks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        }
    }

    getHooks() {
        return this._defaultHook ? [this._defaultHook, ...this._extendHooks] : this._extendHooks;
    }

    setStatus(status: FormatPainterStatus) {
        this._updateRangeMark(status);
        this._status$.next(status);
        const hooks = this.getHooks();
        hooks.forEach((hook) => {
            hook.onStatusChange(status);
        });
    }

    getStatus(): FormatPainterStatus {
        return this._status$.getValue();
    }

    setSelectionFormat(format: ISelectionFormatInfo) {
        this._selectionFormat = format;
    }

    getSelectionFormat() {
        return this._selectionFormat;
    }

    applyFormatPainter(range: IRange) {

    }

    private _updateRangeMark(status: FormatPainterStatus) {
        this._markSelectionService.removeAllShapes();

        if (status !== FormatPainterStatus.OFF) {
            const selection = this._selectionManagerService.getLast();
            if (selection) {
                const style = this._selectionManagerService.createCopyPasteSelection();
                if (status === FormatPainterStatus.INFINITE) {
                    this._markId = this._markSelectionService.addShape({ ...selection, style });
                } else {
                    this._markId = this._markSelectionService.addShape({ ...selection, style }, [
                        SetRangeValuesMutation.id,
                    ]);
                }
            }
        }
    }
}
