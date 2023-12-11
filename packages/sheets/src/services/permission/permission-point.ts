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

import { PermissionPoint } from '@univerjs/core';

const SheetEditablePermissionPoint = 'univer.sheet.editable';

export class SheetEditablePermission extends PermissionPoint<boolean> {
    id = SheetEditablePermissionPoint;
    value = true;
    unitID: string;

    constructor(
        private _workbookId: string,
        private _worksheetId: string
    ) {
        super();
        this.unitID = _workbookId;
        this.id = `${SheetEditablePermissionPoint}_${_workbookId}_${_worksheetId}`;
    }
}
