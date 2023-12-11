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

import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';

import styles from './index.module.less';
import type { IFontFamilyProps } from './interface';

export const FontFamily = (props: IFontFamilyProps) => {
    const { value } = props;

    const localeService = useDependency(LocaleService);

    return (
        <div className={styles.uiPluginSheetsFontFamily} style={{ fontFamily: value as string }}>
            {localeService.t(`fontFamily.${(`${value}` ?? '').replace(/\s/g, '')}`)}
        </div>
    );
};
