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

import type {
    DocumentDataModel,
    ICommand,
    IDocumentBody,
    IDocumentData,
    IMutationInfo,
    ITextRange,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { getRetainAndDeleteFromReplace } from '../../basics/retain-delete-params';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';
import { isCustomRangeSplitSymbol } from '../../basics/custom-range';

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

export const EditorInsertTextCommandId = 'doc.command.insert-text';

/**
 * The command to insert text. The changed range could be non-collapsed, mainly use in line break and normal input.
 */
export const InsertCommand: ICommand<IInsertCommandParams> = {
    id: EditorInsertTextCommandId,

    type: CommandType.COMMAND,

    handler: async (accessor, params: IInsertCommandParams) => {
        const commandService = accessor.get(ICommandService);

        const { range, segmentId, body, unitId, textRanges } = params;
        const { startOffset, collapsed } = range;

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (collapsed) {
            if (startOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startOffset,
                    segmentId,
                });
            }
        } else {
            textX.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        textX.push({
            t: TextXActionType.INSERT,
            body,
            len: body.dataStream.length,
            line: 0,
            segmentId,
        });

        doMutation.params.actions = jsonX.editOp(textX.serialize());

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export enum DeleteDirection {
    LEFT,
    RIGHT,
}

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextRange;
    direction: DeleteDirection;
    len?: number;
    segmentId?: string;
}

/**
 * The command to delete text, mainly used in BACKSPACE and DELETE when collapsed is true. ONLY handle collapsed range!!!
 */
export const DeleteCommand: ICommand<IDeleteCommandParams> = {
    id: 'doc.command.delete-text',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IDeleteCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { range, segmentId, unitId, direction, len = 1 } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { startOffset } = range;

        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) {
            return false;
        }

        const dataStream = documentDataModel.getBody()!.dataStream;
        const start = direction === DeleteDirection.LEFT ? startOffset - len : startOffset;
        let count = 0;

        while (isCustomRangeSplitSymbol(dataStream[start - (count + 1)]) && isCustomRangeSplitSymbol(dataStream[start + len + count])) {
            count++;
        }

        const deleteStart = start - (count + 1);
        const deleteLen = len + (count * 2);
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: [{
                    startOffset: deleteStart,
                    endOffset: deleteStart,
                    collapsed: true,
                }],
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (deleteStart > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: deleteStart,
                segmentId,
            });
        }

        textX.push({
            t: TextXActionType.DELETE,
            len: deleteLen,
            line: 0,
            segmentId,
        });

        doMutation.params.actions = jsonX.editOp(textX.serialize());

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface IUpdateCommandParams {
    unitId: string;
    updateBody: IDocumentBody;
    range: ITextRange;
    coverType: UpdateDocsAttributeType;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to update text properties, mainly used in BACKSPACE.
 */
export const UpdateCommand: ICommand<IUpdateCommandParams> = {
    id: 'doc.command.update-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IUpdateCommandParams) => {
        const { range, segmentId, updateBody, coverType, unitId, textRanges } = params;
        const commandService = accessor.get(ICommandService);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const { startOffset, endOffset } = range;

        textX.push({
            t: TextXActionType.RETAIN,
            len: startOffset,
            segmentId,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            body: updateBody,
            len: endOffset - startOffset,
            segmentId,
            coverType,
        });

        doMutation.params.actions = jsonX.editOp(textX.serialize());

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface ICoverCommandParams {
    unitId: string;

    snapshot?: IDocumentData;
    clearUndoRedoStack?: boolean;
}
