import './Views';

import {
    Engine,
    EVENT_TYPE,
    IRenderingEngine,
    IScrollObserverParam,
    IWheelEvent,
    Layer,
    Scene,
    ScrollBar,
    Viewport,
} from '@univerjs/base-render';
import { EventState, ICurrentUniverService, Nullable, ObserverManager, sortRules, Worksheet } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry } from './BaseView';
import { SheetView } from './Views/SheetView';

// workbook
export class CanvasView {
    // TODO: rename to SheetCanvasView
    private _scene: Nullable<Scene>;

    private _views: BaseView[] = []; // worksheet

    constructor(
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(Injector) private readonly _injector: Injector,
        @IRenderingEngine private readonly _engine: Engine
    ) {
        this._initialize();
    }

    getView(key: string) {
        for (const view of this._views) {
            if (view.viewKey === key) {
                return view;
            }
        }
    }

    getSheetView(): SheetView {
        return this.getView(CANVAS_VIEW_KEY.SHEET_VIEW) as SheetView;
    }

    updateToSheet(worksheet: Worksheet) {
        for (const view of this._views) {
            view.onSheetChange(worksheet);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialize() {
        const engine = this._engine;
        const workbook = this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }
        const config = worksheet.getConfig();
        const rowHeader = config.rowHeader;
        const columnHeader = config.columnHeader;

        // How do we know if a business should claim itself as main scene?
        const scene = new Scene(CANVAS_VIEW_KEY.MAIN_SCENE, engine, {
            width: 1500,
            height: 1000,
        });

        scene.openTransformer();

        this._scene = scene;
        const viewMain = new Viewport(CANVAS_VIEW_KEY.VIEW_MAIN, scene, {
            left: rowHeader.width,
            top: columnHeader.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewTop = new Viewport(CANVAS_VIEW_KEY.VIEW_TOP, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        const viewLeft = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
        });
        const viewLeftTop = new Viewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
        });
        // viewMain.linkToViewport(viewLeft, LINK_VIEW_PORT_TYPE.Y);
        // viewMain.linkToViewport(viewTop, LINK_VIEW_PORT_TYPE.X);
        // syncing scroll on the main area to headerbars
        viewMain.onScrollAfterObserver.add((param: IScrollObserverParam) => {
            const { scrollX, scrollY, actualScrollX, actualScrollY } = param;

            viewTop
                .updateScroll({
                    scrollX,
                    actualScrollX,
                })
                .makeDirty(true);

            viewLeft
                .updateScroll({
                    scrollY,
                    actualScrollY,
                })
                .makeDirty(true);
        });

        // sheet zoom [0 ~ 1]
        this._observerManager.requiredObserver<{ zoomRatio: number }>('onZoomRatioSheetObservable').add((value) => {
            this._scene?.scale(value.zoomRatio, value.zoomRatio);
        });

        scene.addViewport(viewMain, viewLeft, viewTop, viewLeftTop).attachControl();

        // 鼠标滚轮缩放
        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                ratioDelta *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    ratioDelta /= 2;
                }

                const sheet = this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                const currentRatio = sheet.getZoomRatio();
                let nextRatio = +parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
                nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

                // sheet.setZoomRatio(nextRatio);

                e.preventDefault();
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const scrollbar = new ScrollBar(viewMain);

        scene.addLayer(Layer.create(scene, [], 0), Layer.create(scene, [], 2));

        this._viewLoader(scene);

        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    private _viewLoader(scene: Scene) {
        CanvasViewRegistry.getData()
            .sort(sortRules)
            .forEach((viewFactory) => {
                this._views.push(viewFactory.create(scene, this._injector));
            });
    }
}
