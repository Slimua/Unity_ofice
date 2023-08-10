import { Ctor, Injector, Optional, Disposable, Dependency } from '@wendellhu/redi';

import { ObserverManager } from '../Observer';
import { Workbook } from '../Sheets/Domain';
import { IWorkbookConfig } from '../Types/Interfaces';
import { Plugin, PluginCtor, PluginStore } from '../Plugin';
import { GenName, Logger } from '../Shared';
import { VersionCode, VersionEnv } from './Version';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet implements Disposable {
    univerSheetConfig: Partial<IWorkbookConfig>;

    private readonly _sheetInjector: Injector;

    private readonly _workbook: Workbook;

    private readonly _pluginStore = new PluginStore();

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}, @Optional(Injector) parentInjector?: Injector) {
        this.univerSheetConfig = univerSheetData;

        this._sheetInjector = this.initializeInjector(parentInjector);
        this.setObserver();
        this._workbook = this._sheetInjector.createInstance(Workbook, univerSheetData);
    }

    static newInstance(univerSheetData: Partial<IWorkbookConfig> = {}): UniverSheet {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: universheet :: ');
        return new UniverSheet(univerSheetData);
    }

    /**
     * get unit id
     */
    getUnitId(): string {
        return this.getWorkBook().getUnitId();
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    dispose(): void {}

    /**
     * Add a plugin into UniverSheet. UniverSheet should add dependencies exposed from this plugin to its DI system.
     *
     * @param plugin constructor of the plugin class
     * @param options options to this plugin
     *
     * @internal
     */
    addPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._sheetInjector.createInstance(plugin as unknown as Ctor<any>, options);

        // TODO: remove context passed in here
        pluginInstance.onCreate({} as any);
        pluginInstance.onMounted({} as any);
        this._pluginStore.addPlugin(pluginInstance);
    }

    private initializeInjector(parentInjector?: Injector): Injector {
        const dependencies: Dependency[] = [[ObserverManager], [GenName]];
        return parentInjector ? parentInjector.createChild(dependencies) : new Injector(dependencies);
    }

    private setObserver(): void {
        new WorkBookObserverImpl().install(this._sheetInjector.get(ObserverManager));
    }
}
