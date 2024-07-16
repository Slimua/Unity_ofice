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
import { ComponentManager, IMenuService, type MenuConfig } from '@univerjs/ui';
import { BuiltInUIPart, IUIPartsService } from '@univerjs/ui';
import { GraphSingle, TextSingle } from '@univerjs/icons';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { SlideSideBar } from '../views/slide-bar/SlideBar';
import { ActivateSlidePageOperation } from '../commands/operations/activate.operation';
import { SetSlidePageThumbOperation } from '../commands/operations/set-thumb.operation';
import { InsertShapeCommand } from '../commands/commands/insert-shape.command';
import { SHAPE_SELECTOR_COMPONENT, ShapeSelector } from '../components/shape-selector';
import { SlideShapeMenuFactory } from './menu';

export interface IUniverSlidesUIConfig {
    menu: MenuConfig;
}

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
@OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSlidesUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._init();
    }

    private _init() {
        this._initCustomComponents();
        this._initCommands();
        this._initUIComponents();
        this._initMenus();
    }

    private _initCommands() {
        [
            InsertShapeCommand,
            ActivateSlidePageOperation,
            SetSlidePageThumbOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initMenus() {
        const { menu = {} } = this._config;

        const menus = [
            SlideShapeMenuFactory,
        ];

        menus.forEach((factory) => {
            this.disposeWithMe(
                this._menuService.addMenuItem(this._injector.invoke(factory), menu)
            );
        });
    }

    private _initCustomComponents() {
        this.disposeWithMe(
            this._componentManager.register(SHAPE_SELECTOR_COMPONENT, ShapeSelector)
        );
        this.disposeWithMe(
            this._componentManager.register('TextSingle', TextSingle)
        );
        this.disposeWithMe(
            this._componentManager.register('GraphSingle', GraphSingle)
        );
    }

    private _initUIComponents() {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(
                BuiltInUIPart.LEFT_SIDEBAR, () => connectInjector(SlideSideBar, this._injector)
            )
        );
    }
}
