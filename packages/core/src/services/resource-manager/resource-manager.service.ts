import { Subject } from 'rxjs';

import { Disposable, toDisposable } from '../../shared/lifecycle';
import { IResourceHook, IResourceManagerService } from './type';

export class ResourceManagerService extends Disposable implements IResourceManagerService {
    private _resourceMap = new Map<string, Map<string, IResourceHook>>();

    private _register$ = new Subject<{ resourceName: string; hook: IResourceHook; unitID: string }>();
    register$ = this._register$.asObservable();

    getAllResource(unitID: string) {
        const resourceMap = this._resourceMap.get(unitID);
        if (resourceMap) {
            return [...resourceMap.keys()].reduce(
                (list, resourceName) => {
                    const hook = resourceMap.get(resourceName);
                    if (hook) {
                        list.push({
                            unitID,
                            resourceName,
                            hook,
                        });
                    }
                    return list;
                },
                [] as Array<{ unitID: string; resourceName: string; hook: IResourceHook }>
            );
        }
        return [];
    }

    /**
     * the pluginName is map to resourceId which is created by serve.
     * @param {string} pluginName
     * @param {ResourceHook<T>} hook
     */
    registerPluginResource(unitID: string, resourceName: string, hook: IResourceHook) {
        const resourceMap = this._resourceMap.get(unitID) || new Map<string, IResourceHook>();
        if (resourceMap.has(resourceName)) {
            throw new Error('the pluginName is registered');
        }
        resourceMap.set(resourceName, hook);
        this._resourceMap.set(unitID, resourceMap);
        this._register$.next({ unitID, resourceName, hook });
        return toDisposable(() => this._resourceMap.delete(resourceName));
    }

    disposePluginResource(unitID: string, pluginName: string) {
        const resourceMap = this._resourceMap.get(unitID);
        resourceMap?.delete(pluginName);
    }

    override dispose(): void {
        this._register$.complete();
        this._resourceMap.clear();
    }
}
