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

import { CommandType, type ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { ThreadCommentModel } from '../../models/thread-comment.model';
import { AddCommentMutation, DeleteCommentMutation, type IUpdateCommentPayload, ResolveCommentMutation, UpdateCommentMutation } from '../mutations/comment.mutation';
import { IThreadCommentDataSourceService } from '../../services/tc-datasource.service';
import type { ICommentUpdateOperationProps } from '../operations/comment.operation';
import { CommentUpdateOperation } from '../operations/comment.operation';

export interface IAddCommentCommandParams {
    unitId: string;
    subUnitId: string;
    comment: IThreadComment;
}

export const AddCommentCommand: ICommand<IAddCommentCommandParams> = {
    id: 'thread-comment.command.add-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const { unitId, subUnitId, comment: originComment } = params;
        const comment = await dataSourceService.addComment(originComment);
        const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
        const isRoot = !originComment.parentId;

        const redo = {
            id: AddCommentMutation.id,
            params: {
                ...params,
                comment,
            },
        };

        if (isRoot) {
            const res = await commandService.executeCommand(redo.id, redo.params);
            const undo = {
                id: DeleteCommentMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    commentId: comment.id,
                },
            };
            res && undoRedoService.pushUndoRedo({
                undoMutations: [undo],
                redoMutations: [redo],
                unitID: unitId,
            });

            return res;
        }

        if (!syncUpdateMutationToColla) {
            commandService.executeCommand(CommentUpdateOperation.id, {
                unitId,
                subUnitId,
                commentId: comment.id,
                threadId: comment.threadId,
                rootId: comment.parentId || comment.id,
                type: 'reply',
            } as ICommentUpdateOperationProps);
            return true;
        }

        return commandService.executeCommand(redo.id, redo.params);
    },
};

export interface IUpdateCommentCommandParams {
    unitId: string;
    subUnitId: string;
    payload: IUpdateCommentPayload;
}

export const UpdateCommentCommand: ICommand<IUpdateCommentCommandParams> = {
    id: 'thread-comment.command.update-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, payload } = params;
        const commandService = accessor.get(ICommandService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
        const current = threadCommentModel.getComment(
            unitId,
            subUnitId,
            payload.commentId
        );

        if (!current) {
            return false;
        }

        const { children, ...currentComment } = current;
        const success = await dataSourceService.updateComment({
            ...currentComment,
            ...payload,
        });

        if (!success) {
            return false;
        }

        if (!syncUpdateMutationToColla) {
            commandService.executeCommand(CommentUpdateOperation.id, {
                unitId,
                subUnitId,
                commentId: currentComment.id,
                threadId: currentComment.threadId,
                rootId: currentComment.parentId || currentComment.id,
                type: 'update',
            } as ICommentUpdateOperationProps);
            return true;
        }

        const redo = {
            id: UpdateCommentMutation.id,
            params,
        };

        commandService.executeCommand(redo.id, redo.params);
        return true;
    },
};

export interface IResolveCommentCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
    resolved: boolean;
}

export const ResolveCommentCommand: ICommand<IResolveCommentCommandParams> = {
    id: 'thread-comment.command.resolve-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, resolved, commentId } = params;
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const currentComment = threadCommentModel.getComment(unitId, subUnitId, commentId);
        const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
        if (!currentComment) {
            return false;
        }

        const success = await dataSourceService.updateComment({
            ...currentComment,
            resolved,
        });

        if (!success) {
            return false;
        }

        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(
            ResolveCommentMutation.id,
            params,
            { onlyLocal: !syncUpdateMutationToColla }
        );
    },
};

export interface IDeleteCommentCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
}

/**
 * Delete Reply
 */
export const DeleteCommentCommand: ICommand<IDeleteCommentCommandParams> = {
    id: 'thread-comment.command.delete-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const commandService = accessor.get(ICommandService);
        const { unitId, subUnitId, commentId } = params;
        const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;

        const comment = threadCommentModel.getComment(unitId, subUnitId, commentId);
        if (!comment) {
            return false;
        }

        if (!(await dataSourceService.deleteComment(commentId, comment.threadId, unitId, subUnitId))) {
            return false;
        }

        const redo = {
            id: DeleteCommentMutation.id,
            params,
        };

        if (!syncUpdateMutationToColla) {
            commandService.executeCommand(CommentUpdateOperation.id, {
                unitId,
                subUnitId,
                commentId: comment.id,
                threadId: comment.threadId,
                rootId: comment.parentId || comment.id,
                type: 'delete',
            });
            return true;
        }

        return commandService.executeCommand(redo.id, redo.params);
    },
};

export interface IDeleteCommentTreeCommandParams {
    unitId: string;
    subUnitId: string;
    commentId: string;
}

export const DeleteCommentTreeCommand: ICommand<IDeleteCommentCommandParams> = {
    id: 'thread-comment.command.delete-comment-tree',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const threadCommentModel = accessor.get(ThreadCommentModel);
        const commandService = accessor.get(ICommandService);
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const { unitId, subUnitId, commentId } = params;

        const commentWithChildren = threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId);
        if (!commentWithChildren) {
            return false;
        }

        if (!(await dataSourceService.deleteComment(commentId, commentWithChildren.root.threadId, unitId, subUnitId))) {
            return false;
        }

        return await commandService.executeCommand(DeleteCommentMutation.id, {
            unitId,
            subUnitId,
            commentId: commentWithChildren.root.id,
        });
    },
};
