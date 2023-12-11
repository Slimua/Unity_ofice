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

import type { BorderStyleTypes } from '../enum/border-style-types';
import type { IColorStyle } from './i-style-data';

/**
 * ShapeProperties
 */
export interface IShapeProperties {
    shapeBackgroundFill: IColorStyle;
    radius?: number;
    outline?: IOutline;
    // shadow: IShadow;
    // link: ILink;
    // contentAlignment: ContentAlignment;
    // autoFit: IAutoFit;
}

export interface IOutline {
    outlineFill: IColorStyle;
    weight: number;
    dashStyle?: BorderStyleTypes;
}
