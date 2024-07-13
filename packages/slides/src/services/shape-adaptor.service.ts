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

import type { IPageElement } from '@univerjs/core';
import { BasicShapes, Disposable, getColorStyle, PageElementType } from '@univerjs/core';
import { Rect } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';

export class ShapeAdaptor extends Disposable implements IDisposable {
    zIndex = 2;

    viewKey = PageElementType.SHAPE;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement) {
        const {
            id,
            zIndex,
            left = 0,
            top = 0,
            width,
            height,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            title,
            description,
        } = pageElement;
        const { shapeType, text, shapeProperties, placeholder, link } = pageElement.shape || {};

        const fill =
            shapeProperties == null ? '' : getColorStyle(shapeProperties.shapeBackgroundFill) || 'rgba(255,255,255,1)';

        const outline = shapeProperties?.outline;
        const strokeStyle: { [key: string]: string | number } = {};
        if (outline) {
            const { outlineFill, weight } = outline;

            strokeStyle.strokeWidth = weight;
            strokeStyle.stroke = getColorStyle(outlineFill) || 'rgba(0,0,0,1)';
        }

        if (shapeType === BasicShapes.Rect) {
            return new Rect(id, {
                fill,
                top,
                left,
                width,
                height,
                zIndex,
                angle,
                scaleX,
                scaleY,
                skewX,
                skewY,
                flipX,
                flipY,
                forceRender: true,
                ...strokeStyle,
            });
        }
        if (shapeType === BasicShapes.RoundRect) {
            const radius = shapeProperties?.radius || 0;
            return new Rect(id, {
                fill,
                top,
                left,
                width,
                height,
                zIndex,
                angle,
                scaleX,
                scaleY,
                skewX,
                skewY,
                flipX,
                flipY,
                forceRender: true,
                radius,
                ...strokeStyle,
            });
        }
        // if (shapeType === ShapeType.ELLIPSE) {
        // }
    }
}
