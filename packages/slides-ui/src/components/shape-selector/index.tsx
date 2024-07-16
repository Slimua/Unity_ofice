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

import React from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { BasicShapes, LocaleService } from '@univerjs/core';

import styles from './index.module.less';

export interface IShapeSelectorProps {
    onChange: (type: BasicShapes) => void;
}

export function ShapeSelector(props: IShapeSelectorProps) {
    const { onChange } = props;

    const localeService = useDependency(LocaleService);

    const shapes = [{
        shape: localeService.t('slides-ui.shape-selector.shapes.rectangle'),
        items: [{
            title: localeService.t('slides-ui.shapes.rectangle'),
            type: BasicShapes.Rect,
        }, {
            title: localeService.t('slides-ui.shapes.rounded-rectangle'),
            type: BasicShapes.RoundRect,
        }],
    }, {
        shape: localeService.t('slides-ui.shape-selector.shapes.lines'),
    }, {
        shape: localeService.t('slides-ui.shape-selector.shapes.blockArrows'),
    }];

    function handleSelectShape(type: BasicShapes) {
        onChange(type);
    }

    return (
        <section className={styles.slidesUiShapeSelector}>
            <ul className={styles.slidesUiShapeSelectorList}>
                {shapes.filter((shape) => shape.items?.length).map((shape) => (
                    <li key={shape.shape} className={styles.slidesUiShapeSelectorItem}>
                        <h3 className={styles.slidesUiShapeSelectorTitle}>
                            {shape.shape}
                        </h3>
                        <ul className={styles.slidesUiShapeSelectorShapeList}>
                            {shape.items?.map((item) => (
                                <li key={item.title} className={styles.slidesUiShapeSelectorShapeItem}>
                                    <a
                                        onClick={() => handleSelectShape(item.type)}
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export const SHAPE_SELECTOR_COMPONENT = 'SLIDES_UI_SHAPE_SELECTOR';
