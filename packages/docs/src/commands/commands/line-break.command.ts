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

import type { ICommand, IParagraph } from '@univerjs/core';
import { CommandType, DataStreamTreeTokenType, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import { InsertCommand } from './core-editing.command';

function generateParagraphs(dataStream: string) {
    const paragraphs: IParagraph[] = [];

    for (let i = 0, len = dataStream.length; i < len; i++) {
        const char = dataStream[i];

        if (char !== DataStreamTreeTokenType.PARAGRAPH) {
            continue;
        }

        paragraphs.push({
            startIndex: i,
        });
    }

    return paragraphs;
}

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const skeleton = docSkeletonManagerService.getCurrent()?.skeleton;

        const activeRange = textSelectionManagerService.getActiveRange();

        if (activeRange == null || skeleton == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();
        const unitId = docDataModel.getUnitId();

        const { startOffset, segmentId, style } = activeRange;
        // move selection
        const textRanges = [
            {
                startOffset: startOffset + 1,
                endOffset: startOffset + 1,
                style,
            },
        ];

        // split paragraph
        const result = await commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: {
                dataStream: DataStreamTreeTokenType.PARAGRAPH,
                paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH),
            },
            range: activeRange,
            textRanges,
            segmentId,
        });

        return result;
    },
};
