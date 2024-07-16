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

export { DocMentionModel } from './models/doc-mention.model';
export { DocMentionService } from './services/doc-mention.service';
export { DOC_MENTION_PLUGIN } from './types/const/const';
export type { IMention, IDocMention } from './types/interfaces/i-mention';
export { MentionType } from './types/enums/mention-type';
export { UniverDocsMentionPlugin } from './plugin';

// #region - all commands
export { AddDocMentionMutation, DeleteDocMentionMutation } from './commands/mutations/doc-mention.mutation';
export type { IAddDocMentionMutationParams, IDeleteDocMentionMutationParams } from './commands/mutations/doc-mention.mutation';
export { AddDocMentionCommand, DeleteDocMentionCommand } from './commands/commands/doc-mention.command';
export type { IAddDocMentionCommandParams, IDeleteDocMentionCommandParams } from './commands/commands/doc-mention.command';
// #endregion
