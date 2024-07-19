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

import { DependentOn, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { UniverDocUniFormulaPlugin } from '@univerjs/uni-formula';
import { DOC_FORMULA_UI_PLUGIN_NAME } from './const';
import { DocFormulaPopupService } from './services/formula-popup.service';
import { DocUniFormulaController } from './controllers/formula-input.controller';

@DependentOn(UniverDocUniFormulaPlugin)
export class UniverDocUniFormulaUIPlugin extends Plugin {
    static override pluginName: string = DOC_FORMULA_UI_PLUGIN_NAME;
    static override type: UniverInstanceType = UniverInstanceType.UNIVER_DOC;

    constructor(
        config: unknown,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            [DocUniFormulaController],
            [DocFormulaPopupService],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
