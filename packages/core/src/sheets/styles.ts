/**
 * Copyright 2023 DreamNum Inc.
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

import type { IKeyType, Nullable } from '../shared';
import { Tools } from '../shared';
import type { ICellDataForSheetInterceptor, IStyleData } from '../types/interfaces';

/**
 * Styles in a workbook, cells locate styles based on style IDs
 *
 * TODO@Dushusir: Cachemap needs to follow style to clear cleared following styles
 */
export class Styles {
    private _styles: IKeyType<Nullable<IStyleData>>;

    private _cacheMap = new Map<string, string>();

    private _maxCacheSize: number;

    constructor(styles: IKeyType<Nullable<IStyleData>> = {}, maxCacheSize = 100) {
        this._styles = styles;
        this._maxCacheSize = maxCacheSize;
        this._generateCacheMap();
    }

    each(
        callback: (
            value: [string, Nullable<IStyleData>],
            index: number,
            array: Array<[string, Nullable<IStyleData>]>
        ) => void
    ) {
        Object.entries(this._styles).forEach(callback);
        return this;
    }

    search(data: IStyleData): string {
        // Take from cache
        const styleObject = JSON.stringify(data);
        if (this._cacheMap.has(styleObject)) {
            const id = this._cacheMap.get(styleObject) as string;
            // Move the accessed entry to the end of the Map to represent its recent usage
            this._cacheMap.delete(styleObject);
            this._cacheMap.set(styleObject, id);

            return id;
        }

        // Check if the data exists in _styles and not in _cacheMap
        const existingId = this.getExistingStyleId(data);
        if (existingId) {
            return existingId;
        }
        return '-1';
    }

    get(id: string | Nullable<IStyleData>): Nullable<IStyleData> {
        if (typeof id !== 'string') return id;
        id = String(id);

        return this._styles[id];
    }

    add(data: IStyleData): string {
        const id = Tools.generateRandomId(6);
        this._styles[id] = data;
        // update cache
        const styleObject = JSON.stringify(data);
        this._cacheMap.set(styleObject, id);

        // Check if cache size exceeds the maximum limit
        if (this._cacheMap.size > this._maxCacheSize) {
            // Remove the least recently used entry (the first entry in the Map)
            const firstEntry = this._cacheMap.entries().next().value;
            this._cacheMap.delete(firstEntry[0]);
        }

        return id;
    }

    setValue(data: Nullable<IStyleData>): Nullable<string> {
        if (data == null) return;
        const result = this.search(data);
        if (result !== '-1') {
            return result;
        }
        return this.add(data);
    }

    toJSON(): IKeyType<Nullable<IStyleData>> {
        return this._styles;
    }

    getStyleByCell(cell: Nullable<ICellDataForSheetInterceptor>): Nullable<IStyleData> {
        let style;
        if (cell && Tools.isObject(cell.s)) {
            style = cell.s as IStyleData;
        } else {
            style = cell?.s && this.get(cell.s);
        }

        const interceptStyle = cell?.interceptorStyle;

        if (interceptStyle) {
            return {
                ...style,
                ...interceptStyle,
            } as IStyleData;
        }

        return style as IStyleData;
    }

    private _generateCacheMap(): void {
        const { _styles, _cacheMap } = this;
        let count = 0;
        for (const id in _styles) {
            const styleObject = JSON.stringify(_styles[id]);
            _cacheMap.set(styleObject, id);
            count++;
            if (count >= this._maxCacheSize) {
                break;
            }
        }
    }

    private getExistingStyleId(data: IStyleData): Nullable<string> {
        const { _styles } = this;
        for (const id in _styles) {
            if (Tools.diffValue(_styles[id], data)) {
                return id;
            }
        }
        return null;
    }
}
