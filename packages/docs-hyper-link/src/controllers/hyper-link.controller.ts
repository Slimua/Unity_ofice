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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { AddDocHyperLinkMutation } from '../commands/mutations/add-link.mutation';
import { UpdateDocHyperLinkMutation } from '../commands/mutations/update-link.mutation';
import { DeleteDocHyperLinkMutation } from '../commands/mutations/delete-link.mutation';

@OnLifecycle(LifecycleStages.Starting, DocHyperLinkController)
export class DocHyperLinkController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCommands();
    }

    private _initCommands() {
        [
            AddDocHyperLinkMutation,
            UpdateDocHyperLinkMutation,
            DeleteDocHyperLinkMutation,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }
}
