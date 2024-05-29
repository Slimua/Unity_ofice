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

import type { ICellData } from '@univerjs/core';
import type { IIconType } from '../models/icon-map';

export interface IDataBarRenderParams {
    color: string;
    value: number; // -100 - 100.
    startPoint: number; //0-100
    isGradient: boolean;
    isShowValue: boolean;
    isSkip?: boolean;

}
export interface IDataBarCellData extends ICellData {
    dataBar?: IDataBarRenderParams;
}

export interface IIconSetRenderParams {
    iconId: string;
    iconType: IIconType;
    isShowValue: boolean;
    isSkip?: boolean;
}

export interface IIconSetCellData extends ICellData {
    iconSet?: IIconSetRenderParams;
    _originV?: ICellData['v'];
}
export type IConditionalFormattingCellData = IDataBarCellData & IIconSetCellData;
