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

import type { IShapeProps, UniverRenderingContext } from '@univerjs/engine-render';
import { Rect, Shape } from '@univerjs/engine-render';

export interface ISheetFindReplaceHighlightShapeProps extends IShapeProps {
    activated?: boolean;
}

export class SheetFindReplaceHighlightShape extends Shape<ISheetFindReplaceHighlightShapeProps> {
    protected _activated = false;

    constructor(key?: string, props?: ISheetFindReplaceHighlightShapeProps) {
        super(key, props);

        if (props) {
            this.setShapeProps(props);
        }
    }

    setShapeProps(props: Partial<ISheetFindReplaceHighlightShapeProps>): void {
        this._activated = !!props.activated;

        this.transformByState({
            width: props.width!,
            height: props.height!,
        });
    }

    protected override _draw(ctx: CanvasRenderingContext2D): void {
        Rect.drawWith(ctx as UniverRenderingContext, {
            width: this.width,
            height: this.height,
            fill: 'rgba(89, 208, 30, 0.2)',
            evented: false,
        });
    }
}
