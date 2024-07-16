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

import type { ICommand, SlideDataModel } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

export const InsertShapeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'slide.command.insert-shape',
    handler: async (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const slideDataModel = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        if (!slideDataModel) return false;

        console.log(slideDataModel.apply);

        // const commandService = accessor.get(ICommandService);
        // const contextService = accessor.get(IContextService);
        // const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        // if (isCellEditorFocus) {
        //     return commandService.executeCommand(SetInlineFormatTextColorCommand.id, params);
        // }

        // return commandService.executeCommand(SetTextColorCommand.id, params);
        return true;
    },
};
