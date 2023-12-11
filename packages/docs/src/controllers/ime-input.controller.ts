/**
 * Copyright 2023 DreamNum Inc.
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
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import type { IEditorInputConfig, ITextRangeWithStyle } from '@univerjs/engine-render';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

import { getDocObject } from '../basics/component-tools';
import { IMEInputCommand } from '../commands/commands/ime-input.command';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { IMEInputManagerService } from '../services/ime-input-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, IMEInputController)
export class IMEInputController extends Disposable {
    private _previousIMEContent: string = '';

    private _previousIMERange: Nullable<ITextRangeWithStyle>;

    private _onStartSubscription: Nullable<Subscription>;

    private _onUpdateSubscription: Nullable<Subscription>;

    private _onEndSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(IMEInputManagerService) private readonly _imeInputManagerService: IMEInputManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._onStartSubscription?.unsubscribe();
        this._onUpdateSubscription?.unsubscribe();
        this._onEndSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialOnCompositionstart();

        this._initialOnCompositionUpdate();

        this._initialOnCompositionend();
    }

    private _initialOnCompositionstart() {
        this._onStartSubscription = this._textSelectionRenderManager.onCompositionstart$.subscribe((config) => {
            if (config == null) {
                return;
            }

            const { activeRange } = config;

            if (activeRange == null) {
                return;
            }

            this._imeInputManagerService.clearUndoRedoMutationParamsCache();

            this._imeInputManagerService.setActiveRange(Tools.deepClone(activeRange));

            this._previousIMERange = activeRange;
        });
    }

    private _initialOnCompositionUpdate() {
        this._onUpdateSubscription = this._textSelectionRenderManager.onCompositionupdate$.subscribe(async (config) => {
            this._updateContent(config, true);
        });
    }

    private _initialOnCompositionend() {
        this._onEndSubscription = this._textSelectionRenderManager.onCompositionend$.subscribe((config) => {
            this._updateContent(config, false);
        });
    }

    private async _updateContent(config: Nullable<IEditorInputConfig>, isUpdate: boolean) {
        const skeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

        if (this._previousIMERange == null || config == null || skeleton == null) {
            return;
        }

        const documentModel = this._currentUniverService.getCurrentUniverDocInstance();

        const { event, activeRange } = config;

        const { startOffset, segmentId, style } = this._previousIMERange;

        if (skeleton == null || activeRange == null) {
            return;
        }

        const e = event as CompositionEvent;

        const content = e.data;

        if (content === this._previousIMEContent && isUpdate) {
            return;
        }

        const len = content.length;

        const textRanges = [
            {
                startOffset: startOffset + len,
                endOffset: startOffset + len,
                collapsed: true,
                style,
            },
        ];

        await this._commandService.executeCommand(IMEInputCommand.id, {
            unitId: documentModel.getUnitId(),
            newText: content,
            oldTextLen: this._previousIMEContent.length,
            range: this._previousIMERange,
            textRanges,
            isCompositionEnd: !isUpdate,
            segmentId,
        });

        skeleton.calculate();

        if (isUpdate) {
            if (!this._previousIMERange.collapsed) {
                this._previousIMERange.collapsed = true;
            }

            this._previousIMEContent = content;
        } else {
            this._resetIME();
        }
    }

    private _resetIME() {
        this._previousIMEContent = '';

        this._previousIMERange = null;

        this._imeInputManagerService.clearUndoRedoMutationParamsCache();

        this._imeInputManagerService.setActiveRange(null);
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
