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

import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type { Documents, IPageRenderConfig } from '@univerjs/engine-render';
import { IRenderManagerService, Rect } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';

const PAGE_STROKE_COLOR = 'rgba(198, 198, 198, 1)';

const PAGE_FILL_COLOR = 'rgba(255, 255, 255, 1)';

@OnLifecycle(LifecycleStages.Rendered, PageRenderController)
export class PageRenderController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(IUniverInstanceService) private readonly _currentUniverService: IUniverInstanceService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId == null) {
                return;
            }

            if (this._currentUniverService.getUniverDocInstance(unitId) == null) {
                return;
            }

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent } = currentRender;

            const docsComponent = mainComponent as Documents;

            const pageSize = docsComponent.getSkeleton()?.getPageSize();

            docsComponent.onPageRenderObservable.add((config: IPageRenderConfig) => {
                if ([DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY].includes(unitId)) {
                    return;
                }

                // Draw page borders
                const { page, pageLeft, pageTop, ctx } = config;
                const { width, pageWidth, height, pageHeight } = page;

                ctx.save();

                ctx.translate(pageLeft - 0.5, pageTop - 0.5);
                Rect.drawWith(ctx, {
                    width: pageSize?.width ?? pageWidth ?? width,
                    height: pageSize?.height ?? pageHeight ?? height,
                    strokeWidth: 1,
                    stroke: PAGE_STROKE_COLOR,
                    fill: PAGE_FILL_COLOR,
                    zIndex: 3,
                });
                ctx.restore();
            });
        });
    }

    private _commandExecutedListener() {}
}
