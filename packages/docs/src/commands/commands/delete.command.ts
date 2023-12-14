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

import type { ICommand, IDocumentBody, IMutationInfo, IParagraph, ITextRun } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import type { IActiveTextRange, TextRange } from '@univerjs/engine-render';
import { getParagraphBySpan, hasListSpan, isFirstSpan, isIndentBySpan } from '@univerjs/engine-render';

import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';
import type { ITextActiveRange } from '../../services/text-selection-manager.service';
import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { CutContentCommand } from './clipboard.inner.command';
import { DeleteCommand, DeleteDirection, UpdateCommand } from './core-editing.command';

// Handle BACKSPACE.
export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = textSelectionManagerService.getActiveRange();
        const ranges = textSelectionManagerService.getSelections();
        const skeleton = docSkeletonManagerService.getCurrent()?.skeleton;

        let result;

        if (activeRange == null || skeleton == null || ranges == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the first position of the first paragraph.
        if (startOffset === 0 && collapsed) {
            return true;
        }

        const preSpan = skeleton.findNodeByCharIndex(startOffset);

        // is in bullet list?
        const preIsBullet = hasListSpan(preSpan);
        // is in indented paragraph?
        const preIsIndent = isIndentBySpan(preSpan, docDataModel.body);

        let cursor = startOffset;

        // Get the deleted span.
        const span = skeleton.findNodeByCharIndex(startOffset - 1)!;

        const isUpdateParagraph =
            isFirstSpan(preSpan) && span !== preSpan && (preIsBullet === true || preIsIndent === true);

        if (isUpdateParagraph) {
            const paragraph = getParagraphBySpan(preSpan, docDataModel.body);

            if (paragraph == null) {
                return false;
            }

            const paragraphIndex = paragraph?.startIndex;

            const updateParagraph: IParagraph = { startIndex: 0 };

            const paragraphStyle = paragraph.paragraphStyle;

            if (preIsBullet === true) {
                const paragraphStyle = paragraph.paragraphStyle;

                if (paragraphStyle) {
                    updateParagraph.paragraphStyle = paragraphStyle;
                }
            } else if (preIsIndent === true) {
                const bullet = paragraph.bullet;

                if (bullet) {
                    updateParagraph.bullet = bullet;
                }

                if (paragraphStyle != null) {
                    updateParagraph.paragraphStyle = { ...paragraphStyle };
                    delete updateParagraph.paragraphStyle.hanging;
                    delete updateParagraph.paragraphStyle.indentStart;
                }
            }

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            result = await commandService.executeCommand(UpdateCommand.id, {
                unitId: docDataModel.getUnitId(),
                updateBody: {
                    dataStream: '',
                    paragraphs: [{ ...updateParagraph }],
                },
                range: {
                    startOffset: paragraphIndex,
                    endOffset: paragraphIndex + 1,
                },
                textRanges,
                coverType: UpdateDocsAttributeType.REPLACE,
                segmentId,
            });
        } else {
            if (collapsed === true) {
                if (span.content === '\r') {
                    result = await commandService.executeCommand(MergeTwoParagraphCommand.id, {
                        direction: DeleteDirection.LEFT,
                        range: activeRange,
                    });
                } else {
                    cursor -= span.count;

                    const textRanges = [
                        {
                            startOffset: cursor,
                            endOffset: cursor,
                            style,
                        },
                    ];
                    result = await commandService.executeCommand(DeleteCommand.id, {
                        unitId: docDataModel.getUnitId(),
                        range: activeRange,
                        segmentId,
                        direction: DeleteDirection.LEFT,
                        len: span.count,
                        textRanges,
                    });
                }
            } else {
                const textRanges = getTextRangesWhenDelete(activeRange, ranges);
                // If the selection is not closed, the effect of Delete and
                // BACKSPACE is the same as CUT, so the CUT command is executed.
                result = await commandService.executeCommand(CutContentCommand.id, {
                    segmentId,
                    textRanges,
                });
            }
        }

        return result;
    },
};

// handle Delete key
export const DeleteRightCommand: ICommand = {
    id: 'doc.command.delete-right',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRange = textSelectionManagerService.getActiveRange();
        const ranges = textSelectionManagerService.getSelections();

        const skeleton = docSkeletonManagerService.getCurrent()?.skeleton;

        let result;

        if (activeRange == null || skeleton == null || ranges == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        // No need to delete when the cursor is at the last position of the last paragraph.
        if (startOffset === docDataModel.getBody()!.dataStream.length - 2 && collapsed) {
            return true;
        }

        if (collapsed === true) {
            const textRanges = [
                {
                    startOffset,
                    endOffset: startOffset,
                    style,
                },
            ];

            const needDeleteSpan = skeleton.findNodeByCharIndex(startOffset)!;

            result = await commandService.executeCommand(DeleteCommand.id, {
                unitId: docDataModel.getUnitId(),
                range: activeRange,
                segmentId,
                direction: DeleteDirection.RIGHT,
                textRanges,
                len: needDeleteSpan.count,
            });
        } else {
            const textRanges = getTextRangesWhenDelete(activeRange, ranges);

            // If the selection is not closed, the effect of Delete and
            // BACKSPACE is the same as CUT, so the CUT command is executed.
            result = await commandService.executeCommand(CutContentCommand.id, {
                segmentId,
                textRanges,
            });
        }

        return result;
    },
};

interface IMergeTwoParagraphParams {
    direction: DeleteDirection;
    range: IActiveTextRange;
}

export const MergeTwoParagraphCommand: ICommand<IMergeTwoParagraphParams> = {
    id: 'doc.command.merge-two-paragraph',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IMergeTwoParagraphParams) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const currentUniverService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { direction, range } = params;

        const activeRange = textSelectionManagerService.getActiveRange();
        const ranges = textSelectionManagerService.getSelections();

        if (activeRange == null || ranges == null) {
            return false;
        }

        const docDataModel = currentUniverService.getCurrentUniverDocInstance();

        const { startOffset, collapsed, segmentId, style } = activeRange;

        if (!collapsed) {
            return false;
        }

        const startIndex = direction === DeleteDirection.LEFT ? startOffset : startOffset + 1;
        const endIndex = docDataModel.getBody()?.paragraphs?.find((p) => p.startIndex >= startIndex)?.startIndex!;
        const body = getParagraphBody(docDataModel.getBody()!, startIndex, endIndex);

        const cursor = direction === DeleteDirection.LEFT ? startIndex - 1 : endIndex;

        const unitId = docDataModel.getUnitId();

        const textRanges = [
            {
                startOffset: cursor,
                endOffset: cursor,
                style,
            },
        ];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        doMutation.params.mutations.push({
            t: 'r',
            len: direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset,
            segmentId,
        });

        if (body.dataStream.length) {
            doMutation.params.mutations.push({
                t: 'i',
                body,
                len: body.dataStream.length,
                line: 0,
                segmentId,
            });
        }

        doMutation.params.mutations.push({
            t: 'r',
            len: 1,
            segmentId,
        });

        doMutation.params.mutations.push({
            t: 'd',
            len: endIndex + 1 - startIndex,
            line: 0,
            segmentId,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RichTextEditingMutation.id, params: result }],
                redoMutations: [{ id: RichTextEditingMutation.id, params: doMutation.params }],
                undo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, result);

                    textSelectionManagerService.replaceTextRanges([range]);

                    return true;
                },
                redo() {
                    commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutation.params);

                    textSelectionManagerService.replaceTextRanges(textRanges);

                    return true;
                },
            });

            return true;
        }

        return false;
    },
};

function getParagraphBody(body: IDocumentBody, startIndex: number, endIndex: number): IDocumentBody {
    const { textRuns: originTextRuns } = body;
    const dataStream = body.dataStream.substring(startIndex, endIndex);

    if (originTextRuns == null) {
        return {
            dataStream,
        };
    }

    const textRuns: ITextRun[] = [];

    for (const textRun of originTextRuns) {
        const { st, ed } = textRun;
        if (ed <= startIndex || st >= endIndex) {
            continue;
        }

        if (st < startIndex) {
            textRuns.push({
                ...textRun,
                st: 0,
                ed: ed - startIndex,
            });
        } else if (ed > endIndex) {
            textRuns.push({
                ...textRun,
                st: st - startIndex,
                ed: endIndex - startIndex,
            });
        } else {
            textRuns.push({
                ...textRun,
                st: st - startIndex,
                ed: ed - startIndex,
            });
        }
    }

    return {
        dataStream,
        textRuns,
    };
}

// get cursor position when BACKSPACE/DELETE excuse the CutContentCommand.
function getTextRangesWhenDelete(activeRange: ITextActiveRange, ranges: readonly TextRange[]) {
    let cursor = activeRange.endOffset;

    for (const range of ranges) {
        const { startOffset, endOffset } = range;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        if (endOffset <= activeRange.endOffset) {
            cursor -= endOffset - startOffset;
        }
    }

    const textRanges = [
        {
            startOffset: cursor,
            endOffset: cursor,
            style: activeRange.style,
        },
    ];

    return textRanges;
}
