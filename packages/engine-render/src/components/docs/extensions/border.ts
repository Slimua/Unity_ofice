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

import type { BorderStyleTypes, IBorderData, IBorderStyleData, IScale, Nullable } from '@univerjs/core';
import { getColorStyle } from '@univerjs/core';

import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../../basics/const';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import type { IDocumentSkeletonSpan } from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsBorderExtension';

export class Border extends docExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 30;

    private _preBorderStyle: Nullable<BorderStyleTypes>;

    private _preBorderColor = '';

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { asc: maxLineAsc = 0, lineHeight = 0 } = line;

        const { ts: textStyle, left, width: spanWidth } = span;
        if (!textStyle) {
            return;
        }

        const { bd: borderData } = textStyle;
        if (!borderData) {
            return;
        }
        const scale = this._getScale(parentScale);
        const borderCache = this._createBorderCache(borderData);

        const { spanStartPoint = Vector2.create(0, 0) } = this.extensionOffset;

        for (const type of borderCache.keys()) {
            const borderCacheValue = borderCache.get(type);
            if (!borderCacheValue) {
                continue;
            }
            const { s: style, cl: colorStyle } = borderCacheValue;
            const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

            if (style !== this._preBorderStyle) {
                setLineType(ctx, style);
                ctx.lineWidth = getLineWidth(style) / scale;
                this._preBorderStyle = style;
            }

            if (color !== this._preBorderColor) {
                ctx.strokeStyle = color || COLOR_BLACK_RGB;
                this._preBorderColor = color;
            }

            drawLineByBorderType(ctx, type as BORDER_TYPE, {
                startX: spanStartPoint.x,
                startY: spanStartPoint.y,
                endX: spanStartPoint.x + spanWidth,
                endY: spanStartPoint.y + lineHeight,
            });
        }
    }

    override clearCache() {
        this._preBorderStyle = null;
        this._preBorderColor = '';
    }

    private _createBorderCache(borderData: IBorderData) {
        const { t, b, l, r } = borderData;
        const borderCache = new Map<BORDER_TYPE, Nullable<IBorderStyleData>>();
        t && borderCache.set(BORDER_TYPE.TOP, t);
        b && borderCache.set(BORDER_TYPE.BOTTOM, b);
        l && borderCache.set(BORDER_TYPE.LEFT, l);
        r && borderCache.set(BORDER_TYPE.RIGHT, r);
        return borderCache;
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Border());
