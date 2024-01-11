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

import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';

import { ToggleFindReplaceDialogOperation } from '../commands/operations/find-replace.operation';

export function FindReplaceMenuItemFactory(): IMenuButtonItem {
    return {
        id: ToggleFindReplaceDialogOperation.id,
        icon: 'SearchIcon',
        tooltip: 'toolbar.find-replace',
        group: MenuGroup.TOOLBAR_OTHERS,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
    };
}
