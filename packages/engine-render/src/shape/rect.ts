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

import { type IKeyValue, Rectangle } from '@univerjs/core';

import type { UniverRenderingContext } from '../context';
import type { IViewportInfo } from '../basics/vector2';
import type { IShapeProps } from './shape';
import { Shape } from './shape';

export interface IRectProps extends IShapeProps {
    radius?: number;
}

export const RECT_OBJECT_ARRAY = ['radius'];

export class Rect<T extends IRectProps = IRectProps> extends Shape<T> {
    private _radius: number = 0;

    constructor(key?: string, props?: T) {
        super(key, props);
        if (props?.radius) {
            this._radius = props.radius;
        }
    }

    get radius() {
        return this._radius;
    }

    static override drawWith(ctx: UniverRenderingContext, props: IRectProps | Rect) {
        let { radius, width, height } = props;

        radius = radius ?? 0;
        width = width ?? 30;
        height = height ?? 30;

        ctx.beginPath();

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }

        if (!radius) {
            // simple rect - don't bother doing all that complicated maths stuff.
            ctx.rect(0, 0, width, height);
        } else {
            let topLeft = 0;
            let topRight = 0;
            let bottomLeft = 0;
            let bottomRight = 0;
            topLeft = topRight = bottomLeft = bottomRight = Math.min(radius, width / 2, height / 2);

            ctx.moveTo(topLeft, 0);
            ctx.lineTo(width - topRight, 0);
            ctx.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
            ctx.lineTo(width, height - bottomRight);
            ctx.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
            ctx.lineTo(bottomLeft, height);
            ctx.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
            ctx.lineTo(0, topLeft);
            ctx.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
        }

        ctx.closePath();
        this._renderPaintInOrder(ctx, props);
    }

    override toJson() {
        const props: IKeyValue = {};
        RECT_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Rect]) {
                props[key] = this[key as keyof Rect];
            }
        });

        return {
            ...super.toJson(),
            ...props,
        };
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const m = this.transform.getMatrix();
        const top = this.top;
        const left = this.left;
        let w = this.width;
        let h = this.height;
        const rect = { left, top, right: left + w, bottom: top + h };
        if (bounds && bounds.viewportKey === 'viewMain' && Rectangle.hasIntersectionBetweenTwoRect(rect, bounds.cacheBound)) {
            rect.left += bounds.viewBound.left;
            rect.right += bounds.viewBound.left;
            rect.top += bounds?.viewBound.top;
            rect.bottom += bounds?.viewBound.top;
            const intersectRect = Rectangle.getIntersectionBetweenTwoRect(rect, bounds.viewBound);
            w = intersectRect?.width || 0;
            h = intersectRect?.height || 0;
        }
        if (bounds && bounds?.viewBound.bottom > 200 && this.strokeDashArray) {
            if (rect.left > 40 && w > 60 && h > 60 && top < 20) {
                console.log('rect', rect, bounds?.viewBound, w, h);
            }
        }
        // this.width = w;
        // this.height = h;
        const { radius, width, height, paintFirst, stroke, strokeWidth, fill, strokeScaleEnabled, fillRule, strokeLineCap, strokeDashOffset, strokeLineJoin, strokeMiterLimit, strokeDashArray } = this;
        if (!strokeDashArray) {
            Rect.drawWith(ctx, this);
        } else {
            console.log('rect dash w, h', w, h);
            Rect.drawWith(ctx, { ...{ radius, width, height, paintFirst, stroke, strokeWidth, fill, strokeScaleEnabled, fillRule, strokeLineCap, strokeDashOffset, strokeLineJoin, strokeMiterLimit, strokeDashArray }, ...{ width: w, height: h } });
        }
        // Rect.drawWith(ctx, { ...this, width: w, height: h });
    }
}
