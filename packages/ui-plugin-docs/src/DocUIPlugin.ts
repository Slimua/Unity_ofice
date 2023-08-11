import { Plugin, Context, PLUGIN_NAMES, Tools, Univer, PluginType } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { ComponentManager, RegisterManager } from '@univerjs/base-ui';
import { zh, en } from './Locale';
import { DOC_UI_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { DefaultDocUiConfig, IDocUIPluginConfig } from './Basics';
import { AppUIController } from './Controller';

export class DocUIPlugin extends Plugin<any> {
    static override type = PluginType.Doc;

    private _appUIController: AppUIController;

    private _config: IDocUIPluginConfig;

    private _registerManager: RegisterManager;

    private _componentManager: ComponentManager;

    constructor(config?: IDocUIPluginConfig) {
        super(DOC_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultDocUiConfig, config);
    }

    static create(config?: IDocUIPluginConfig) {
        return new DocUIPlugin(config);
    }

    installTo(univerInstance: Univer) {
        univerInstance.install(this);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        this._componentManager = new ComponentManager();
        this._appUIController = new AppUIController(this);
    }

    getConfig() {
        return this._config;
    }

    initRender(container: HTMLElement) {
        const engine = this.getPluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER)?.getEngine()!;

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

    getAppUIController() {
        return this._appUIController;
    }

    getComponentManager() {
        return this._componentManager;
    }

    /**
     * usage this._clipboardExtensionManager.handle(data);
     * @returns
     */
    getRegisterManager(): RegisterManager {
        return this._registerManager;
    }

    /**
     * This API is used in plugins for initialization that depends on UI rendering
     * @param cb
     * @returns
     */
    UIDidMount(cb: Function) {
        this._appUIController.getDocContainerController().UIDidMount(cb);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}