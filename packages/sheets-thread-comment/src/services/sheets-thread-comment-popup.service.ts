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

import type { Nullable } from '@univerjs/core';
import { Disposable, DisposableCollection } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { type IDisposable, Inject } from '@wendellhu/redi';
import { Subject } from 'rxjs';
import { THREAD_COMMENT_POPUP } from '../types/const';

export class SheetsThreadCommentPopupService extends Disposable {
    private _lastPopup: Nullable<IDisposable> = null;
    private _activePopup: Nullable<ISheetLocation>;
    private _activePopup$ = new Subject<Nullable<ISheetLocation>>();

    activePopup$ = this._activePopup$.asObservable();

    get activePopup() {
        return this._activePopup;
    }

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopupManagerService: SheetCanvasPopManagerService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService
    ) {
        super();
    }

    showPopup(location: ISheetLocation, onHide?: () => void) {
        const { row, col } = location;

        this._lastPopup && this._lastPopup.dispose();
        if (this._zenZoneService.visible) {
            return;
        }

        this._activePopup = location;
        this._activePopup$.next(location);

        const popupDisposable = this._canvasPopupManagerService.attachPopupToCell(
            row,
            col,
            {
                componentKey: THREAD_COMMENT_POPUP,
                onClickOutside: () => {
                    this.hidePopup();
                },
                offset: [0, 3],
            }
        );

        if (!popupDisposable) {
            throw new Error('[SheetsThreadCommentPopupService]: cannot show popup!');
        }

        const disposableCollection = new DisposableCollection();
        disposableCollection.add(popupDisposable);
        disposableCollection.add({
            dispose: () => {
                onHide?.();
            },
        });

        this._lastPopup = disposableCollection;
    }

    hidePopup() {
        if (!this._activePopup) {
            return;
        }
        this._lastPopup && this._lastPopup.dispose();
        this._lastPopup = null;

        this._activePopup = null;
        this._activePopup$.next(null);
    }
}
