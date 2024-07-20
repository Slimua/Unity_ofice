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

import { Disposable, Inject } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';

export class DocResizeRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService
    ) {
        super();

        this._initResize();
    }

    private _initResize() {
        this.disposeWithMe(this._context.engine.onTransformChange$.subscribeEvent((evt) => {
            if (evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize) {
                this._docPageLayoutService.calculatePagePosition();
            }
        }));
    }
}
