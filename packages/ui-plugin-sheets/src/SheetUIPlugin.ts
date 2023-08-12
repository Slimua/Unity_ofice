import { Inject, Injector } from '@wendellhu/redi';
import { Plugin, Tools, Univer, PluginType, LocaleService } from '@univerjs/core';
import { ComponentManager, getRefElement, RegisterManager, KeyboardManager, SlotComponent, ZIndexManager, SlotManager } from '@univerjs/base-ui';
import { IRenderingEngine } from '@univerjs/base-render';
import { DefaultSheetUIConfig, installObserver, ISheetUIPluginConfig, SheetUIPluginObserve, SHEET_UI_PLUGIN_NAME } from './Basics';
import { AppUIController } from './Controller/AppUIController';
import { Fx } from './View/FormulaBar';
import { SlotComponentProps } from './Controller/SlotController';
import { IToolbarItemProps } from './Controller/ToolbarUIController';
import { zh, en } from './Locale';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve> {
    static override type = PluginType.Sheet;

    private _appUIController: AppUIController;

    private _keyboardManager: KeyboardManager;

    private _registerManager: RegisterManager;

    private _config: ISheetUIPluginConfig;

    private _zIndexManager: ZIndexManager;

    private _componentManager: ComponentManager;

    constructor(config: ISheetUIPluginConfig, @Inject(Injector) override readonly _injector: Injector, @Inject(LocaleService) private readonly _localeService: LocaleService) {
        super(SHEET_UI_PLUGIN_NAME);

        this._config = Tools.deepMerge({}, DefaultSheetUIConfig, config);
    }

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
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
        const container = getRefElement(this._appUIController.getSheetContainerController().getContentRef());

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
    getRegisterManager(): RegisterManager {
        return this._registerManager;
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
        return this._appUIController.getSheetContainerController().getMainSlotController().getSlot(name);
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController.getSheetContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController.getSheetContainerController().getToolbarController().deleteToolbarConfig(name);
    }

    private initializeDependencies(): void {
        this._injector.add([KeyboardManager]);
        this._injector.add([RegisterManager]);
        this._injector.add([ComponentManager]);
        this._injector.add([ZIndexManager]);
        this._injector.add([SlotManager]);

        // TODO: maybe we don't have to instantiate these dependencies manually
        this._componentManager = this._injector.get(ComponentManager);
        this._keyboardManager = this._injector.get(KeyboardManager);
        this._zIndexManager = this._injector.get(ZIndexManager);
        this._registerManager = this._injector.get(RegisterManager);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
    }
}