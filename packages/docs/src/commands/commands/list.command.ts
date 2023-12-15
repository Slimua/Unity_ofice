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

import type { ICommand, IMutationInfo, IParagraph } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    MemoryCursor,
    PresetListType,
    Tools,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import type { IActiveTextRange } from '@univerjs/engine-render';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

interface IOrderListCommandParams {}

export const OrderListCommand: ICommand<IOrderListCommandParams> = {
    id: 'doc.command.order-list',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const dataModel = currentUniverService.getCurrentUniverDocInstance();

        const activeRange = textSelectionManagerService.getActiveRange();
        const paragraphs = dataModel.getBody()?.paragraphs;

        if (activeRange == null || paragraphs == null) {
            return false;
        }

        const currentParagraphs = getParagraphsInRange(activeRange, paragraphs);

        const { segmentId } = activeRange;

        const unitId = dataModel.getUnitId();

        const isAlreadyOrdered = currentParagraphs.every(
            (paragraph) => paragraph.bullet?.listType === PresetListType.ORDER_LIST
        );

        const ID_LENGTH = 6;

        console.log(currentParagraphs);

        console.log(isAlreadyOrdered);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        for (const paragraph of currentParagraphs) {
            const { startIndex } = paragraph;

            doMutation.params.mutations.push({
                t: 'r',
                len: startIndex - memoryCursor.cursor,
                segmentId,
            });

            doMutation.params.mutations.push({
                t: 'r',
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        isAlreadyOrdered
                            ? {
                                  ...paragraph,
                                  startIndex: 0,
                              }
                            : {
                                  ...paragraph,
                                  startIndex: 0,
                                  bullet: {
                                      ...(paragraph.bullet ?? {
                                          nestingLevel: 0,
                                          textStyle: {
                                              fs: 20,
                                          },
                                      }),
                                      listType: PresetListType.ORDER_LIST,
                                      listId: Tools.generateRandomId(ID_LENGTH),
                                  },
                              },
                    ],
                },
                segmentId,
                coverType: UpdateDocsAttributeType.REPLACE,
            });

            memoryCursor.moveCursorTo(startIndex + 1);
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.refreshSelection();

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.refreshSelection();

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.refreshSelection();

                    return true;
                },
            });

            return true;
        }

        return true;
    },
};

interface IBulletListCommandParams {}

export const BulletListCommand: ICommand<IBulletListCommandParams> = {
    id: 'doc.command.bullet-list',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        return true;
    },
};

function getParagraphsInRange(activeRange: IActiveTextRange, paragraphs: IParagraph[]) {
    const { startOffset, endOffset } = activeRange;
    const results: IParagraph[] = [];

    let start = 0;

    for (const paragraph of paragraphs) {
        const { startIndex } = paragraph;

        if ((startOffset > start && startOffset <= startIndex) || (endOffset > start && endOffset <= startIndex)) {
            results.push(paragraph);
        } else if (startIndex >= startOffset && startIndex <= endOffset) {
            results.push(paragraph);
        }

        start = startIndex;
    }

    return results;
}
