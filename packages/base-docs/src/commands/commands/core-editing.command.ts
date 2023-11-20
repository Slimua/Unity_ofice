import { ITextRangeWithStyle } from '@univerjs/base-render';
import {
    CommandType,
    createEmptyDocSnapshot,
    ICommand,
    ICommandInfo,
    ICommandService,
    IDocumentBody,
    IDocumentData,
    IMutationInfo,
    ITextRange,
    IUndoRedoService,
    IUniverInstanceService,
    UpdateDocsAttributeType,
} from '@univerjs/core';

import { TextSelectionManagerService } from '../../services/text-selection-manager.service';
import {
    IDeleteMutationParams,
    IRetainMutationParams,
    IRichTextEditingMutationParams,
    RichTextEditingMutation,
} from '../mutations/core-editing.mutation';

// TODO: @JOCS, do not use command as event bus.
export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const DeleteRightCommand: ICommand = {
    id: 'doc.command.delete-right',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to insert text. The changed range could be non-collapsed.
 */
export const InsertCommand: ICommand<IInsertCommandParams> = {
    id: 'doc.command.insert-text',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IInsertCommandParams) => {
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const { range, segmentId, body, unitId, textRanges } = params;
        const { startOffset, collapsed } = range;

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (collapsed) {
            doMutation.params!.mutations.push({
                t: 'r',
                len: startOffset,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        doMutation.params!.mutations.push({
            t: 'i',
            body,
            len: body.dataStream.length,
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

export enum DeleteDirection {
    LEFT,
    RIGHT,
}

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextRange;
    direction: DeleteDirection;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to delete text, mainly used in BACKSPACE.
 */
export const DeleteCommand: ICommand<IDeleteCommandParams> = {
    id: 'doc.command.delete-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params) => {
        if (!params) {
            throw new Error();
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const { range, segmentId, unitId, direction, textRanges } = params;
        const { collapsed, startOffset } = range;
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (collapsed) {
            if (startOffset > 0) {
                doMutation.params!.mutations.push({
                    t: 'r',
                    len: direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset,
                    segmentId,
                });
            }

            doMutation.params!.mutations.push({
                t: 'd',
                len: 1,
                line: 0,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

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
            return false;
        }

        return false;
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

    handler: async (accessor, params) => {
        if (!params) {
            throw new Error();
        }

        const { range, segmentId, updateBody, coverType, unitId, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        const { startOffset, endOffset } = range;

        doMutation.params!.mutations.push({
            t: 'r',
            len: startOffset,
            segmentId,
        });

        doMutation.params!.mutations.push({
            t: 'r',
            body: updateBody,
            len: endOffset - startOffset,
            segmentId,
            coverType,
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

export interface IIMEInputCommandParams {
    unitId: string;
    newText: string;
    oldTextLen: number;
    range: ITextRange;
    textRanges: ITextRangeWithStyle[];
    isCompositionEnd: boolean;
    segmentId?: string;
}

export const IMEInputCommand: ICommand<IIMEInputCommandParams> = {
    id: 'doc.command.ime-input',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IIMEInputCommandParams) => {
        const { unitId, newText, oldTextLen, range, segmentId, textRanges, isCompositionEnd } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                mutations: [],
            },
        };

        if (range.collapsed) {
            doMutation.params!.mutations.push({
                t: 'r',
                len: range.startOffset,
                segmentId,
            });
        } else {
            doMutation.params!.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
        }

        if (oldTextLen > 0) {
            doMutation.params!.mutations.push({
                t: 'd',
                len: oldTextLen,
                line: 0,
                segmentId,
            });
        }

        doMutation.params!.mutations.push({
            t: 'i',
            body: {
                dataStream: newText,
            },
            len: newText.length,
            line: 0,
            segmentId,
        });

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        console.log(result);

        textSelectionManagerService.replaceTextRanges(textRanges);

        if (isCompositionEnd) {
            if (result) {
                const undoMutationParams: IRichTextEditingMutationParams = {
                    unitId,
                    mutations: [],
                };

                const doMutationParams: IRichTextEditingMutationParams = {
                    unitId,
                    mutations: [],
                };

                if (range.collapsed) {
                    undoMutationParams.mutations.push({
                        t: 'r',
                        len: range.startOffset,
                        segmentId,
                    });
                    doMutationParams.mutations.push({
                        t: 'r',
                        len: range.startOffset,
                        segmentId,
                    });
                } else {
                    undoMutationParams.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
                    doMutationParams.mutations.push(...getRetainAndDeleteFromReplace(range, segmentId));
                }

                if (newText.length) {
                    undoMutationParams.mutations.push({
                        t: 'd',
                        len: newText.length,
                        line: 0,
                        segmentId,
                    });

                    doMutationParams.mutations.push({
                        t: 'i',
                        body: {
                            dataStream: newText,
                        },
                        len: newText.length,
                        line: 0,
                        segmentId,
                    });
                }

                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: [{ id: RichTextEditingMutation.id, params: undoMutationParams }],
                    redoMutations: [{ id: RichTextEditingMutation.id, params: doMutationParams }],
                    undo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, undoMutationParams);

                        textSelectionManagerService.replaceTextRanges([range]);

                        return true;
                    },
                    redo() {
                        commandService.syncExecuteCommand(RichTextEditingMutation.id, doMutationParams);

                        textSelectionManagerService.replaceTextRanges(textRanges);

                        return true;
                    },
                });

                return true;
            }
        } else {
            return !!result;
        }

        return false;
    },
};

export interface ICoverCommandParams {
    unitId: string;

    snapshot?: IDocumentData;
    clearUndoRedoStack?: boolean;
}

// Cover all content with new snapshot or empty doc, and clear undo redo stack.
export const CoverCommand: ICommand<ICoverCommandParams> = {
    id: 'doc.command-cover-content',
    type: CommandType.COMMAND,
    handler: async (accessor, params: ICoverCommandParams) => {
        const { unitId, snapshot, clearUndoRedoStack } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getUniverDocInstance(unitId);

        if (!doc) {
            return false;
        }

        doc.reset(snapshot || createEmptyDocSnapshot());

        if (clearUndoRedoStack) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.clearUndoRedo(unitId);
        }

        return true;
    },
};

export function getRetainAndDeleteFromReplace(
    range: ITextRange,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainMutationParams | IDeleteMutationParams> {
    const { startOffset, endOffset } = range;
    const dos: Array<IRetainMutationParams | IDeleteMutationParams> = [];

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    if (textStart > 0) {
        dos.push({
            t: 'r',
            len: textStart,
            segmentId,
        });
    }

    dos.push({
        t: 'd',
        len: textEnd - textStart,
        line: 0,
        segmentId,
    });

    return dos;
}
