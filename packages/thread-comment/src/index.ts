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

export { ThreadCommentModel, type CommentUpdate } from './models/thread-comment.model';
export { ThreadCommentResourceController } from './controllers/tc-resource.controller';
export { TC_PLUGIN_NAME } from './types/const';
export type { IThreadComment, IThreadCommentMention } from './types/interfaces/i-thread-comment';

export { UniverThreadCommentPlugin } from './plugin';
export { IThreadCommentDataSourceService, ThreadCommentDataSourceService } from './services/tc-datasource.service';

// #region - all commands

export {
    AddCommentMutation,
    DeleteCommentMutation,
    ResolveCommentMutation,
    UpdateCommentMutation,
    UpdateCommentRefMutation,
} from './commands/mutations/comment.mutation';
export type {
    IAddCommentMutationParams,
    IDeleteCommentMutationParams,
    IResolveCommentMutationParams,
    IUpdateCommentMutationParams,
    IUpdateCommentPayload,
    IUpdateCommentRefMutationParams,
} from './commands/mutations/comment.mutation';
export {
    AddCommentCommand,
    DeleteCommentCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
    DeleteCommentTreeCommand,
} from './commands/commands/comment.command';
export type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
    IDeleteCommentTreeCommandParams,
    IUpdateCommentRefCommandParams,
    IUpdateCommentRefPayload,
} from './commands/commands/comment.command';

// #endregion
