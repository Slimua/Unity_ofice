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

import { Disposable, ICommandService, Inject, IResourceManagerService, IUniverInstanceService, LifecycleService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IDrawingSubunitMap } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { filter, first } from 'rxjs/operators';
import type { ISlideDrawing } from '../services/slide-drawing.service';
import { ISlideDrawingService } from '../services/slide-drawing.service';
import { SetDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';

export const SLIDE_DRAWING_PLUGIN = 'SLIDE_DRAWING_PLUGIN';

@OnLifecycle(LifecycleStages.Starting, SlidesDrawingLoadController)
export class SlidesDrawingLoadController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(this._commandService.registerCommand(SetDrawingApplyMutation));
    }
}

@OnLifecycle(LifecycleStages.Starting, SlidesDrawingController)
export class SlidesDrawingController extends Disposable {
    constructor(
        @ISlideDrawingService private readonly _slideDrawingService: ISlideDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();

        this._drawingInitializeListener();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const map = this._slideDrawingService.getDrawingDataForUnit(unitId);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDrawingSubunitMap<ISlideDrawing> => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDrawingSubunitMap<ISlideDrawing>>({
                pluginName: SLIDE_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SLIDE],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._slideDrawingService.removeDrawingDataForUnit(unitId);
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                },
                onLoad: (unitId, value) => {
                    console.log('onLoad slide', unitId, value);
                    this._slideDrawingService.registerDrawingData(unitId, value);
                },
            })
        );
    }

    private _drawingInitializeListener() {
        this._lifecycleService.lifecycle$.pipe(filter((e) => e === LifecycleStages.Steady), first()).subscribe(() => {
            const unitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SLIDE)?.getUnitId();
            if (!unitId) {
                return;
            }
            this._slideDrawingService.initializeNotification(unitId);
        });
    }
}
