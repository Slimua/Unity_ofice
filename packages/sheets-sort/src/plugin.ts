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

import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';

import { SheetsSortController } from './controllers/sheets-sort.controller';
import { SheetsSortService } from './services/sheets-sort.service';

const NAME = 'UNIVER_SHEETS_SORT_PLUGIN';

export class UniverSheetsSortPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        _config: unknown,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            [SheetsSortController],
            [SheetsSortService],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
