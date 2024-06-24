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

import type { DocumentDataModel, ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import type { ActiveCommentInfo } from '@univerjs/thread-comment-ui';
import { getDT, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocThreadCommentPanel } from '../../views/doc-thread-comment-panel';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import { DocThreadCommentService } from '../../services/doc-thread-comment.service';

export interface IShowCommentPanelOperationParams {
    activeComment: ActiveCommentInfo;
}

export const ShowCommentPanelOperation: ICommand<IShowCommentPanelOperationParams> = {
    id: 'docs.operation.show-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor, params) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const sidebarService = accessor.get(ISidebarService);

        sidebarService.open({
            header: { title: 'comment' },
            children: { label: DocThreadCommentPanel.componentKey },
            width: 312,
            onClose: () => panelService.setPanelVisible(false),
        });
        panelService.setPanelVisible(true);
        if (params) {
            panelService.setActiveComment(params?.activeComment);
        }

        return true;
    },
};

export const StartAddCommentOperation: ICommand = {
    id: 'docs.operation.start-add-comment',
    type: CommandType.OPERATION,
    handler(accessor) {
        const panelService = accessor.get(ThreadCommentPanelService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const userManagerService = accessor.get(UserManagerService);
        const docCommentService = accessor.get(DocThreadCommentService);
        const commandService = accessor.get(ICommandService);

        const textRange = textSelectionManagerService.getActiveRange();
        if (!doc || !textRange) {
            return false;
        }

        if (!panelService.panelVisible) {
            commandService.executeCommand(ShowCommentPanelOperation.id);
        }

        if (textRange.collapsed) {
            return true;
        }

        const unitId = doc.getUnitId();
        const text = doc.getBody()?.dataStream.slice(textRange.startOffset, textRange.endOffset) ?? '';
        const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
        const commentId = '';

        const comment = {
            unitId,
            subUnitId,
            id: commentId,
            ref: text,
            dT: getDT(),
            personId: userManagerService.getCurrentUser().userID,
            text: {
                dataStream: '\r\n',
            },
            startOffset: textRange.startOffset!,
            endOffset: textRange.endOffset!,
            collapsed: true,
        };
        docCommentService.startAdd(comment);
        panelService.setActiveComment({
            unitId,
            subUnitId,
            commentId,
        });

        return true;
    },
};
