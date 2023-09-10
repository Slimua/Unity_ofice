import { Engine } from '@univerjs/base-render';
import { ContextService, DesktopPlatformService, IContextService, IPlatformService, IShortcutService } from '@univerjs/base-ui';
import { ICommand, ICommandService, LocaleService, ObserverManager, Plugin, PLUGIN_NAMES, PluginType, UIObserver } from '@univerjs/core';
import { Dependency, Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { DocPluginObserve, install } from './Basics/Observer';
import { BreakLineCommand, CoverCommand, DeleteCommand, DeleteLeftCommand, IMEInputCommand, InsertCommand, UpdateCommand } from './commands/commands/core-editing.command';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
import { MoveCursorOperation } from './commands/operations/cursor.operation';
import { DocumentController } from './Controller/DocumentController';
import { en, zh } from './Locale';
import { DocsViewManagerService } from './services/docs-view-manager/docs-view-manager.service';
import { BreakLineShortcut, DeleteLeftShortcut } from './shortcuts/core-editing.shortcut';
import { MoveCursorDownShortcut, MoveCursorLeftShortcut, MoveCursorRightShortcut, MoveCursorUpShortcut } from './shortcuts/cursor.shortcut';
import { CANVAS_VIEW_KEY } from './View/Render';
import { CanvasView } from './View/Render/CanvasView';
import { DocsView } from './View/Render/Views';

export interface IDocPluginConfig {}

const DEFAULT_DOCUMENT_PLUGIN_DATA = {};

export class DocPlugin extends Plugin<DocPluginObserve> {
    static override type = PluginType.Doc;

    private _config: IDocPluginConfig;

    private _canvasView: CanvasView;

    private _canvasEngine: Engine;

    private _documentController: DocumentController;

    constructor(
        config: Partial<IDocPluginConfig> = {},
        @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @SkipSelf() @Inject(Injector) private readonly _univerInjector: Injector,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAMES.DOCUMENT);

        this._config = Object.assign(DEFAULT_DOCUMENT_PLUGIN_DATA, config);
        this._initializeDependencies(_injector, _univerInjector);
        this.initializeCommands();
    }

    initialize(): void {
        this._localeService.getLocale().load({
            en,
            zh,
        });

        install(this);

        this.listenEventManager();
        this.initCanvasView();
        this.initController();
    }

    initializeCommands(): void {
        (
            [
                MoveCursorOperation,
                DeleteLeftCommand,
                BreakLineCommand,
                InsertCommand,
                DeleteCommand,
                UpdateCommand,
                IMEInputCommand,
                RichTextEditingMutation,
                CoverCommand,
            ] as ICommand[]
        ).forEach((command) => {
            this._injector.get(ICommandService).registerCommand(command);
        });

        [MoveCursorUpShortcut, MoveCursorDownShortcut, MoveCursorRightShortcut, MoveCursorLeftShortcut, DeleteLeftShortcut, BreakLineShortcut].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    initializeAfterUI() {
        // this.initCanvasView();
        // this.initController();
    }

    initController() {
        this._documentController = new DocumentController(this._injector);
    }

    initCanvasView() {
        // this._canvasView = this._injector.get(CanvasView);
    }

    listenEventManager() {
        // FIXME@wzhudev: this looks strange to be. It should not rely on the event created by a upper layer plugin.
        // Instead, upper layer plugin should call it.
        this._getCoreObserver<boolean>('onUIDidMountObservable').add(() => {
            this.initializeAfterUI();
        });
    }

    getConfig() {
        return this._config;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getCanvasEngine() {
        return this._canvasEngine;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getCanvasView() {
        return this._canvasView;
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getMainScene() {
        return this._canvasEngine.getScene(CANVAS_VIEW_KEY.MAIN_SCENE);
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getDocsView() {
        return this.getCanvasView().getDocsView();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getMainComponent() {
        return (this.getDocsView() as DocsView).getDocs();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getInputEvent() {
        return this.getMainComponent().getEditorInputEvent();
    }

    /**
     * @deprecated use DI to get underlying dependencies
     * @returns
     */
    getDocumentController() {
        return this._documentController;
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {}

    /** @deprecated This will be removed. Modules should inject `ObserverManager` instead of getting it from plugin. */
    protected _getCoreObserver<T>(type: string) {
        return this._globalObserverManager.requiredObserver<UIObserver<T>>(type, 'core');
    }

    private _initializeDependencies(docInjector: Injector, univerInjector: Injector) {
        (
            [
                [CanvasView], // FIXME: CanvasView shouldn't be a dependency of DocPlugin. Because it maybe created dynamically.
                [IPlatformService, { useClass: DesktopPlatformService }],
                [IContextService, { useClass: ContextService }],
            ] as Dependency[]
        ).forEach((d) => docInjector.add(d));

        // add docs view manager to univer-level injector
        univerInjector.add([DocsViewManagerService]);
    }
}
