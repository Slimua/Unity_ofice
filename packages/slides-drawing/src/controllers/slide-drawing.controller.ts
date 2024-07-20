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

import type { ISlideData, SlideDataModel } from '@univerjs/core';
import { Disposable, ICommandService, Inject, IResourceManagerService, IUniverInstanceService, LifecycleService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IDrawingMapItem, IDrawingMapItemData } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { filter, first } from 'rxjs/operators';
import { type ISlideDrawing, ISlideDrawingService } from '../services/slide-drawing.service';

export const SLIDES_DRAWING_PLUGIN = 'SLIDE_DRAWING_PLUGIN';
export interface ISlideDrawingModel { drawings?: ISlideData['drawings']; drawingsOrder?: ISlideData['drawingsOrder'] };

@OnLifecycle(LifecycleStages.Starting, SlideDrawingLoadController)
export class SlideDrawingLoadController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }
}

@OnLifecycle(LifecycleStages.Starting, SlideDrawingController)
export class SlideDrawingController extends Disposable {
    constructor(
        @ISlideDrawingService private readonly _slideDrawingService: ISlideDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService
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
            if (map?.[unitId]) {
                return JSON.stringify(map?.[unitId]);
            }
            return '';
        };
        const parseJson = (json: string): IDrawingMapItem<ISlideDrawing> => {
            if (!json) {
                return { data: {}, order: [] };
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return { data: {}, order: [] };
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDrawingMapItem<ISlideDrawing>>({
                pluginName: SLIDES_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_DOC],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._setDrawingDataForUnit(unitId, { data: {}, order: [] });
                },
                onLoad: (unitId, value) => {
                    this._setDrawingDataForUnit(unitId, { data: value.data ?? {}, order: value.order ?? [] });
                },
            })
        );
    }

    private _setDrawingDataForUnit(unitId: string, drawingMapItem: IDrawingMapItem<ISlideDrawing>) {
        const slideDataModel = this._univerInstanceService.getUnit<SlideDataModel>(unitId);
        if (slideDataModel == null) {
            return;
        }

        slideDataModel.resetDrawing(drawingMapItem.data, drawingMapItem.order);
        this._initDataLoader();
    }

    private _initDataLoader(): boolean {
        const dataModel = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!dataModel) {
            return false;
        }

        const unitId = dataModel.getUnitId();
        const subUnitId = unitId;

        const drawingDataModels = dataModel.getDrawings();
        const drawingOrderModel = dataModel.getDrawingsOrder();

        if (!drawingDataModels || !drawingOrderModel) {
            return false;
        }

        // TODO@wzhudev: should move to docs-drawing.

        Object.keys(drawingDataModels).forEach((drawingId) => {
            const drawingDataModel = drawingDataModels[drawingId];
            // const docTransform = drawingDataModel.docTransform;
            // const transform = docDrawingPositionToTransform(docTransform);

            drawingDataModels[drawingId] = { ...drawingDataModel } as ISlideDrawing;
        });

        const subDrawings = {
            [subUnitId]: {
                unitId,
                subUnitId,
                data: drawingDataModels as IDrawingMapItemData<ISlideDrawing>,
                order: drawingOrderModel,
            },
        };

        this._slideDrawingService.registerDrawingData(unitId, subDrawings);
        this._drawingManagerService.registerDrawingData(unitId, subDrawings);
        return true;
    }

    private _drawingInitializeListener() {
        this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered), first()).subscribe((stage) => {
            const unitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId();
            if (!unitId) {
                return;
            }
            this._slideDrawingService.initializeNotification(unitId);
            this._drawingManagerService.initializeNotification(unitId);
        });
    }
}
