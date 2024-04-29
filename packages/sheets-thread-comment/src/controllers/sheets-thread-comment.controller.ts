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

import { Disposable, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { CommentSingle } from '@univerjs/icons';
import { THREAD_COMMENT_PANEL } from '@univerjs/thread-comment-ui';
import { SheetsThreadCommentCell } from '../views/sheets-thread-comment-cell';
import { COMMENT_SINGLE_ICON, SHEETS_THREAD_COMMENT_MODAL } from '../types/const';
import { SheetsThreadCommentPanel } from '../views/sheets-thread-comment-panel';
import { enUS, zhCN } from '../locales';
import { threadCommentMenu, threadPanelMenu } from './menu';

@OnLifecycle(LifecycleStages.Starting, SheetsThreadCommentController)
export class SheetsThreadCommentController extends Disposable {
    constructor(
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._initMenu();
        this._initComponent();
        this._initLocale();
    }

    private _initMenu() {
        [
            threadCommentMenu,
            threadPanelMenu,
        ].forEach((menu) => {
            this._menuService.addMenuItem(menu(this._injector));
        });
    }

    private _initComponent() {
        ([
            [SHEETS_THREAD_COMMENT_MODAL, SheetsThreadCommentCell],
            [THREAD_COMMENT_PANEL, SheetsThreadCommentPanel],
            [COMMENT_SINGLE_ICON, CommentSingle],
        ] as const).forEach(([key, comp]) => {
            this._componentManager.register(key, comp);
        });
    }

    private _initLocale() {
        this._localeService.load({
            zhCN,
            enUS,
        });
    }
}
