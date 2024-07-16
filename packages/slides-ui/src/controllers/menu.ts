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

import type { BasicShapes } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import type { IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { InsertShapeCommand } from '../commands/commands/insert-shape.command';
import { SHAPE_SELECTOR_COMPONENT } from '../components/shape-selector';

export function SlideShapeMenuFactory(accessor: IAccessor): IMenuSelectorItem<BasicShapes> {
    return {
        id: InsertShapeCommand.id,
        icon: 'GraphSingle',
        tooltip: 'slides-ui.menu.shapes',
        group: MenuGroup.TOOLBAR_FORMAT,
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: {
                    name: SHAPE_SELECTOR_COMPONENT,
                    hoverable: false,
                },
                // value$: borderStyleManagerService.borderInfo$,
            },
        ],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}
