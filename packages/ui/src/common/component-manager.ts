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

import { toDisposable } from '@univerjs/core';
import {
    AdjustHeight,
    AdjustWidth,
    AlignBottomSingle,
    AlignTopSingle,
    AllBorderSingle,
    AutoHeight,
    AutowrapSingle,
    AvgSingle,
    BoldSingle,
    BrushSingle,
    CancelFreezeSingle,
    CancelMergeSingle,
    ClearFormat,
    CntSingle,
    CodeSingle,
    ContentSingle16,
    Copy,
    DeleteCellMoveDown,
    DeleteCellShiftLeft,
    DeleteCellShiftRight,
    DeleteCellShiftUp,
    DeleteColumn,
    DeleteRow,
    DownBorder,
    FontColor,
    FreezeColumnSingle,
    FreezeRowSingle,
    FreezeToSelectedSingle,
    FunctionSingle,
    Hide,
    HorizontallySingle,
    HorizontalMergeSingle,
    InnerBorder,
    Insert,
    InsertCellDown,
    InsertCellShiftRight,
    InsertRowAbove,
    InsertRowBelow,
    ItalicSingle,
    KeyboardSingle,
    LeftBorder,
    LeftInsertColumn,
    LeftJustifyingSingle,
    LeftRotationFortyFiveDegreesSingle,
    LeftRotationNinetyDegreesSingle,
    MaxSingle,
    MergeAllSingle,
    MinSingle,
    NoBorderSingle,
    NoColor,
    NoRotationSingle,
    OuterBorder,
    OverflowSingle,
    PaintBucket,
    PasteSpecial,
    PipingSingle,
    RedoSingle,
    Reduce,
    RightBorder,
    RightInsertColumn,
    RightJustifyingSingle,
    RightRotationFortyFiveDegreesSingle,
    RightRotationNinetyDegreesSingle,
    StrikethroughSingle,
    SumSingle,
    TruncationSingle,
    UnderlineSingle,
    UndoSingle,
    UpBorder,
    VerticalCenterSingle,
    VerticalIntegrationSingle,
    VerticalTextSingle,
} from '@univerjs/icons';
import type { IDisposable } from '@wendellhu/redi';

export interface ICustomComponent {
    name: string;
    props?: any;
}

export type ComponentList = Map<string, React.ForwardRefExoticComponent<any>>;

export class ComponentManager {
    private _components: ComponentList = new Map();

    constructor() {
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            AlignBottomSingle,
            AlignTopSingle,
            AllBorderSingle,
            AutowrapSingle,
            BoldSingle,
            BrushSingle,
            Copy,
            ClearFormat,
            DownBorder,
            FontColor,
            FunctionSingle,
            HorizontallySingle,
            InnerBorder,
            ItalicSingle,
            KeyboardSingle,
            ContentSingle16,
            LeftBorder,
            LeftJustifyingSingle,
            LeftRotationFortyFiveDegreesSingle,
            LeftRotationNinetyDegreesSingle,
            MergeAllSingle,
            HorizontalMergeSingle,
            VerticalIntegrationSingle,
            PipingSingle,
            CancelMergeSingle,
            NoBorderSingle,
            NoColor,
            NoRotationSingle,
            OuterBorder,
            OverflowSingle,
            PaintBucket,
            PasteSpecial,
            RedoSingle,
            RightBorder,
            RightJustifyingSingle,
            RightRotationFortyFiveDegreesSingle,
            RightRotationNinetyDegreesSingle,
            StrikethroughSingle,
            TruncationSingle,
            UnderlineSingle,
            UndoSingle,
            UpBorder,
            VerticalCenterSingle,
            VerticalTextSingle,
            Insert,
            InsertCellDown,
            InsertCellShiftRight,
            InsertRowAbove,
            InsertRowBelow,
            LeftInsertColumn,
            RightInsertColumn,
            DeleteColumn,
            DeleteRow,
            DeleteCellShiftUp,
            DeleteCellShiftRight,
            DeleteCellShiftLeft,
            DeleteCellMoveDown,
            Reduce,
            Hide,
            AutoHeight,
            AdjustHeight,
            AdjustWidth,
            AvgSingle,
            CntSingle,
            MaxSingle,
            MinSingle,
            SumSingle,
            CancelFreezeSingle,
            FreezeColumnSingle,
            FreezeRowSingle,
            FreezeToSelectedSingle,
            CodeSingle,
        };

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }
    }

    register(name: string, component: any): IDisposable {
        if (this._components.has(name)) {
            console.warn(`Component ${name} already exists.`);
        }

        this._components.set(name, component);
        return toDisposable(() => this._components.delete(name));
    }

    get(name: string) {
        return this._components.get(name);
    }

    delete(name: string) {
        this._components.delete(name);
    }
}
