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

import type { IOperation } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';

import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { EndEditController } from '../../controllers/editor/end-edit.controller';

export const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const editorBridgeService = accessor.get(IEditorBridgeService);

        if (params == null) {
            return false;
        }

        editorBridgeService.changeVisible(params);

        return true;
    },
};

export const SetCellEditVisibleWithF2Operation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible-f2',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const endEditorController = accessor.get(EndEditController);

        commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, params);
        endEditorController.updateCursorChangeState();

        return true;
    },
};

/**
 * When the editor is not clicked to change the cursor,
 * the arrow keys will exit editing and move the cell.
 */
export const SetCellEditVisibleArrowOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible-arrow',
    type: CommandType.OPERATION,
    handler: () => true,
};
