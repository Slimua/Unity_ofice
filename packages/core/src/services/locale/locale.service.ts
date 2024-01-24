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

import { Subject } from 'rxjs';

import type { Nullable } from '../../common/type-utils';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import type { ILocales } from '../../shared/locale';
import { Tools } from '../../shared/tools';
import { LocaleType } from '../../types/enum/locale-type';

/**
 * get value from Locale object and key
 * @param locale - A specified language pack
 * @param key - Specify key
 * @returns Get the translation corresponding to the Key
 *
 * @private
 */
function getValue(locale: ILocales[LocaleType], key: string): Nullable<string> {
    if (!locale) return;

    try {
        if (locale[key]) return locale[key] as string;

        return key.split('.').reduce((a: any, b: string) => a[b], locale);
    } catch (error) {
        console.warn('Key %s not found', key);
        return key;
    }
}

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService extends Disposable {
    private _currentLocale: LocaleType = LocaleType.ZH_CN;

    private _locales: ILocales | null = null;

    localeChanged$ = new Subject<void>();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => this.localeChanged$.complete()));
    }

    /**
     * Load more locales after init
     *
     * @param locales - Locale object
     * @returns void
     *
     */
    load(locales: ILocales) {
        this._locales = Tools.deepMerge(this._locales ?? {}, locales);
    }

    t = (key: string): string => {
        if (!this._locales) throw new Error('Locale not initialized');

        return getValue(this._locales[this._currentLocale], key) ?? key;
    };

    setLocale(locale: LocaleType): void {
        this._currentLocale = locale;
        this.localeChanged$.next();
    }

    getLocales() {
        return this._locales?.[this._currentLocale];
    }

    getCurrentLocale() {
        return this._currentLocale;
    }
}
