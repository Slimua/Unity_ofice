import { ComponentManager, DragManager, getRefElement } from '@univerjs/base-ui';
import { LocaleService, LocaleType, ObserverManager } from '@univerjs/core';
import { Inject, Injector, Self, SkipSelf } from '@wendellhu/redi';
import { ISlideUIPluginConfig } from '../Basics';
import { SlideContainer } from '../View';
import { InfoBarUIController } from './InfoBarUIController';
import { SlideBarUIController } from './SlideBarUIController';
import { ToolbarUIController } from './ToolbarUIController';

export class SlideContainerUIController {
    private _slideContainer: SlideContainer;

    private _toolbarController: ToolbarUIController;

    private _infoBarController: InfoBarUIController;

    private _slideBarController: SlideBarUIController;

    private _config: ISlideUIPluginConfig;

    constructor(
        config: ISlideUIPluginConfig,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Self() @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(DragManager) private readonly _dragManager: DragManager
    ) {
        this._config = config;
        this._toolbarController = this._injector.createInstance(ToolbarUIController, this._config.layout?.toolbarConfig);
        this._infoBarController = this._injector.createInstance(InfoBarUIController);
        this._slideBarController = this._injector.createInstance(SlideBarUIController);
        // this._dragManager = this._injector.createInstance(DragManager);
    }

    getUIConfig() {
        const config = {
            injector: this._injector,
            config: this._config,
            changeLocale: this.changeLocale,
            getComponent: this.getComponent,
            // 其余组件的props
            methods: {
                toolbar: {
                    getComponent: this._toolbarController.getComponent,
                },

                infoBar: {
                    getComponent: this._infoBarController.getComponent,
                },
                slideBar: {
                    getComponent: this._slideBarController.getComponent,
                    addSlide: this._slideBarController.addSlide,
                    activeSlide: this._slideBarController.activeSlide,
                },
            },
        };
        return config;
    }

    // 获取SlideContainer组件
    getComponent = (ref: SlideContainer) => {
        this._slideContainer = ref;
        this._observerManager.getObserver<SlideContainer>('onUIDidMount')?.notifyObservers(this._slideContainer);
        this._globalObserverManager.requiredObserver<boolean>('onUIDidMountObservable', 'core').notifyObservers(true);

        this.setSlideContainer();
    };

    /**
     * Change language
     * @param {String} lang new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.getLocale().change(locale as LocaleType);

        // publish
        this._globalObserverManager.requiredObserver('onAfterChangeUILocaleObservable', 'core')!.notifyObservers();
    };

    getContentRef() {
        return this._slideContainer.getContentRef();
    }

    getToolbarController() {
        return this._toolbarController;
    }

    UIDidMount(cb: Function) {
        if (this._slideContainer) return cb(this._slideContainer);

        this._observerManager.getObserver('onUIDidMount')?.add(() => cb(this._slideContainer));
    }

    private setSlideContainer() {
        // handle drag event
        this._dragManager.handleDragAction(getRefElement(this._slideContainer));
    }
}
