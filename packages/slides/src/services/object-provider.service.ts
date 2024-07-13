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

import type { IPageElement, PageElementType } from '@univerjs/core';
import { sortRules } from '@univerjs/core';
import { type BaseObject, type Scene, SlideCanvasObjectProviderRegistry } from '@univerjs/engine-render';
import { Inject, Injector } from '@wendellhu/redi';

export interface IObjectAdaptor {
    zIndex: number;

    viewKey: PageElementType | null;

    check(type: PageElementType): IObjectAdaptor | undefined;

    convert(pageElement: IPageElement, mainScene: Scene): void;

    create(injector: Injector): void;
}

export class ObjectProviderService {
    private _adaptors: IObjectAdaptor[] = [];

    constructor(
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._adaptorLoader();
    }

    convertToRenderObjects(pageElements: { [elementId: string]: IPageElement }, mainScene: Scene) {
        const pageKeys = Object.keys(pageElements);
        const objects: BaseObject[] = [];
        pageKeys.forEach((key) => {
            const pageElement = pageElements[key];
            const o = this._executor(pageElement, mainScene);
            if (o != null) {
                objects.push(o);
            }
        });
        return objects;
    }

    private _executor(pageElement: IPageElement, mainScene: Scene) {
        const { id: pageElementId, type } = pageElement;

        for (const adaptor of this._adaptors) {
            const o = adaptor.check(type)?.convert(pageElement, mainScene);
            if (o != null) {
                return o;
            }
        }
    }

    private _adaptorLoader() {
        SlideCanvasObjectProviderRegistry.getData()
            .sort(sortRules)
            .forEach((adaptorFactory: IObjectAdaptor) => {
                this._adaptors.push(adaptorFactory as unknown as IObjectAdaptor);
            });
    }
}
