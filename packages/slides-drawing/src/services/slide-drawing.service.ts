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

import type { ISlideDrawingBase } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';
import { type IImageData, type IUnitDrawingService, UnitDrawingService } from '@univerjs/drawing';

export interface ISlideImage extends IImageData, ISlideDrawingBase {}

/**
 * test type
 */
export interface ISlideShape extends ISlideDrawingBase {}

export type ISlideDrawing = ISlideImage | ISlideShape;

type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type IDocUpdateDrawing = OptionalField<ISlideDrawing, 'slideTransform'>;

export class SlideDrawingService extends UnitDrawingService<ISlideDrawing> {}

export interface ISlideDrawingService extends IUnitDrawingService<ISlideDrawing> {}

export const ISlideDrawingService = createIdentifier<ISlideDrawingService>('univer.slide.plugin.slide-drawing.service');
