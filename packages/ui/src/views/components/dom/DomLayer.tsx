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

import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import type { IDomLayer } from '../../../services/dom/canvas-dom-layer.service';
import { CanvasDomLayerService } from '../../../services/dom/canvas-dom-layer.service';
import { useObservable } from '../../../components/hooks/observable';
import { ComponentManager } from '../../../common';
import styles from './index.module.less';

const DomLayerSingle = (props: { layer: IDomLayer; id: string }) => {
    const { layer, id } = props;
    const componentManager = useDependency(ComponentManager);
    const position = useObservable(layer.position$);
    const Component = componentManager.get(layer.componentKey);

    return position
        ? (
            <div
                onClick={(e) => layer.onClick?.(e as any)}
                className={styles.floatDom}
                id={id}
                style={{
                    position: 'absolute',
                    top: position.startY,
                    left: position.startX,
                    width: position.endX - position.startX - 2,
                    height: position.endY - position.startY - 2,
                    transform: `rotate(${position.rotate}deg)`,
                    overflow: 'hidden',
                }}
            >
                {Component ? <Component /> : null}
            </div>
        )
        : null;
};

export const DomLayer = () => {
    const domLayerService = useDependency(CanvasDomLayerService);
    const layers = useObservable(domLayerService.domLayers$);

    return (
        <>
            {layers?.map((layer) => (
                <DomLayerSingle
                    id={layer[0]}
                    layer={layer[1]}
                    key={layer[0]}
                />
            ))}
        </>
    );
};
