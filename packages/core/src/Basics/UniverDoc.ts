import { Ctor, Inject, Injector } from '@wendellhu/redi';

import { DocumentModel } from '../Docs/Domain/DocumentModel';
import { Plugin, PluginCtor, PluginStore } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../Shared/lifecycle';
import { IDocumentData } from '../Types/Interfaces/IDocumentData';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc extends Disposable {
    private readonly _pluginStore = new PluginStore();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleInitializerService) private readonly _initService: LifecycleInitializerService
    ) {
        super();
    }

    init(): void {
        this.disposeWithMe(
            toDisposable(
                this._injector
                    .get(LifecycleService)
                    .subscribeWithPrevious()
                    .subscribe((stage) => {
                        if (stage === LifecycleStages.Starting) {
                            this._pluginStore.forEachPlugin((p) => p.onStarting(this._injector));
                            this._initService.initModulesOnStage(LifecycleStages.Starting);
                        }

                        if (stage === LifecycleStages.Ready) {
                            this._pluginStore.forEachPlugin((p) => p.onReady());
                            this._initService.initModulesOnStage(LifecycleStages.Ready);
                            return;
                        }

                        if (stage === LifecycleStages.Rendered) {
                            this._pluginStore.forEachPlugin((p) => p.onRendered());
                            this._initService.initModulesOnStage(LifecycleStages.Rendered);
                            return;
                        }

                        if (stage === LifecycleStages.Steady) {
                            this._pluginStore.forEachPlugin((p) => p.onSteady());
                            this._initService.initModulesOnStage(LifecycleStages.Steady);
                        }
                    })
            )
        );
    }

    createDoc(docData: Partial<IDocumentData>): DocumentModel {
        return this._injector.createInstance(DocumentModel, docData);
    }

    addPlugin<T extends Plugin>(pluginCtor: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(pluginCtor as unknown as Ctor<any>, options);
        pluginInstance.onStarting(this._injector);
        this._pluginStore.addPlugin(pluginInstance);
    }
}
