import { IRenderingEngine } from '@univerjs/base-render';
import {
    ComponentManager,
    DesktopMenuService,
    DesktopPlatformService,
    DesktopShortcutService,
    DragManager,
    IMenuService,
    IPlatformService,
    IShortcutService,
    KeyboardManager,
    SharedController,
    SlotComponent,
    SlotManager,
    ZIndexManager,
} from '@univerjs/base-ui';
import { IUndoRedoService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { DefaultSheetUIConfig, installObserver, ISheetUIPluginConfig, SHEET_UI_PLUGIN_NAME, SheetUIPluginObserve } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { DesktopSheetShortcutController } from './Controller/shortcut.controller';
import { SlotComponentProps } from './Controller/SlotController';
import { en, zh } from './Locale';
import { SheetBarService } from './services/sheet-bar.service';
import { Fx } from './View/FormulaBar';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _appUIController: AppUIController;

    private _keyboardManager: KeyboardManager;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _dragManager: DragManager;

    private _componentManager: ComponentManager;

    constructor(config: ISheetUIPluginConfig, @Inject(Injector) override readonly _injector: Injector, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    initialize(): void {
        installObserver(this);

        /**
         * load more Locale object
         *
         * TODO 异步加载
         */
        this._localeService.getLocale().load({
            zh,
            en,
        });

        this.initializeDependencies();

        // AppUIController initializes the DOM as an asynchronous rendering process, and must wait for the UI rendering to complete before starting to render the canvas
        this.UIDidMount(() => {
            this.initRender();
        });
    }

    initRender() {
        const engine = this._injector.get(IRenderingEngine);
        const container = this._appUIController.getSheetContainerController().getContentRef().current;

        if (!container) {
            throw new Error('container is not ready');
        }

        // mount canvas to DOM container
        engine.setContainer(container);

        window.addEventListener('resize', () => {
            engine.resize();
        });

        // should be clear
        setTimeout(() => {
            engine.resize();
        }, 0);
    }

    initUI() {}

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    getAppUIController() {
        return this._appUIController;
    }

    getComponentManager() {
        return this._componentManager;
    }

    getZIndexManager() {
        return this._zIndexManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getKeyboardManager(): KeyboardManager {
        return this._keyboardManager;
    }

    /**
     * Formula Bar API
     * @param str
     */
    setFormulaContent(str: string) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFormulaContent(str);
    }

    setFx(fx: Fx) {
        this._appUIController.getSheetContainerController().getFormulaBarUIController().getFormulaBar().setFx(fx);
    }

    /**
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    UIDidMount(cb: Function) {
        this._appUIController.getSheetContainerController().UIDidMount(cb);
    }

    setSlot(slotName: string, component: SlotComponent, cb?: () => {}) {
        this._appUIController.getSheetContainerController().getSlotManager().setSlotComponent(slotName, component, cb);
    }

    addSlot(name: string, slot: SlotComponentProps, cb?: () => void) {
        this._appUIController.getSheetContainerController().getMainSlotController().addSlot(name, slot, cb);
    }

    getSlot(name: string) {
        // return this._appUIController.getSheetContainerController().getMainSlotController().getSlot(name);
    }

    private initializeDependencies(): void {
        const dependencies: Dependency[] = [
            [DragManager],
            [KeyboardManager],
            [ComponentManager],
            [ZIndexManager],
            [SlotManager],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [SharedController],
            [IMenuService, { useClass: DesktopMenuService }],
            [DesktopSheetShortcutController],
            [SheetBarService],
        ];
        dependencies.forEach((d) => this._injector.add(d));

        this._dragManager = this._injector.get(DragManager);
        this._componentManager = this._injector.get(ComponentManager);
        this._keyboardManager = this._injector.get(KeyboardManager);
        this._zIndexManager = this._injector.get(ZIndexManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
        this._injector.add([AppUIController, { useValue: this._appUIController }]);

        this._injector.get(IUndoRedoService);
        this._injector.get(SharedController);
        this._injector.get(DesktopSheetShortcutController);
    }
}
