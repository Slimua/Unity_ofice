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

import { CommandType, type ICommand } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { SheetsSortUIService } from './../services/sheets-sort-ui.service';

export const SortRangeAscCommand: ICommand = {
    id: 'sheet.command.sort-range-asc',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortDirectly(true);
    },
};

export const SortRangeDescCommand: ICommand = {
    id: 'sheet.command.sort-range-desc',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortDirectly(false);
    },
};

export const SortRangeCustomCommand: ICommand = {
    id: 'sheet.command.sort-range-custom',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortCustomize();
    },
};

export const SortRangeAscInCtxMenuCommand: ICommand = {
    id: 'sheet.command.sort-range-asc-ctx',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortDirectly(true);
    },
};

export const SortRangeDescInCtxMenuCommand: ICommand = {
    id: 'sheet.command.sort-range-desc-ctx',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortDirectly(false);
    },
};

export const SortRangeCustomInCtxMenuCommand: ICommand = {
    id: 'sheet.command.sort-range-custom-ctx',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const sortService = accessor.get(SheetsSortUIService);
        return await sortService.triggerSortCustomize();
    },
};
