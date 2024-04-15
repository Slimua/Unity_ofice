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

import type { ICellData, Nullable } from '@univerjs/core';
import {
    Direction,
    Disposable,
    isFormulaId,
    isFormulaString,
    LifecycleStages,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import { Lexer } from '@univerjs/engine-formula';
import type { AutoFillService, IAutoFillRule, ICopyDataInTypeIndexInfo, ICopyDataPiece } from '@univerjs/sheets-ui';
import { APPLY_TYPE, DATA_TYPE, IAutoFillService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, FormulaAutoFillController)
export class FormulaAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: AutoFillService,
        @Inject(Lexer) private readonly _lexer: Lexer
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerAutoFill();
    }

    private _registerAutoFill(): void {
        const formulaRule: IAutoFillRule = {
            type: DATA_TYPE.FORMULA,
            priority: 1001,
            match: (cellData) => isFormulaString(cellData?.f) || isFormulaId(cellData?.si),
            isContinue: (prev, cur) => {
                if (prev.type === DATA_TYPE.FORMULA) {
                    return true;
                }
                return false;
            },
            applyFunctions: {
                [APPLY_TYPE.COPY]: (dataWithIndex, len, direction, copyDataPiece) => {
                    const { data, index } = dataWithIndex;
                    return this._fillCopyFormula(data, len, direction, index, copyDataPiece);
                },
            },
        };
        this._autoFillService.registerRule(formulaRule);
    }

    private _fillCopyFormula(
        data: Array<Nullable<ICellData>>,
        len: number,
        direction: Direction,
        index: ICopyDataInTypeIndexInfo,
        copyDataPiece: ICopyDataPiece
    ) {
        const step = getDataLength(copyDataPiece);
        const applyData = [];
        const formulaIdMap = new Map<number, string>();

        for (let i = 1; i <= len; i++) {
            const index = (i - 1) % data.length;
            const d = Tools.deepClone(data[index]);

            if (d) {
                const originalFormula = data[index]?.f || '';
                const originalFormulaId = data[index]?.si || '';

                const checkFormula = isFormulaString(originalFormula);
                const checkFormulaId = isFormulaId(originalFormulaId);

                if (checkFormulaId) {
                    d.si = originalFormulaId;
                    d.f = null;
                    d.v = null;
                    d.p = null;

                    if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                        applyData.push(d);
                    } else {
                        applyData.unshift(d);
                    }
                } else if (checkFormula) {
                    // The first position setting formula and formulaId
                    let formulaId = formulaIdMap.get(index);

                    if (!formulaId) {
                        formulaId = Tools.generateRandomId(6);
                        formulaIdMap.set(index, formulaId);

                        const { offsetX, offsetY } = directionToOffset(step, direction);
                        const shiftedFormula = this._lexer.moveFormulaRefOffset(
                            originalFormula,
                            offsetX,
                            offsetY
                        );

                        d.si = formulaId;
                        d.f = shiftedFormula;
                        d.v = null;
                        d.p = null;
                    } else {
                        // At the beginning of the second formula, set formulaId only
                        d.si = formulaId;
                        d.f = null;
                        d.v = null;
                        d.p = null;
                    }

                    if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                        applyData.push(d);
                    } else {
                        applyData.unshift(d);
                    }
                }
            }
        }

        return applyData;
    }
}

function directionToOffset(step: number, direction: Direction) {
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
        case Direction.UP:
            offsetY = -step;
            break;
        case Direction.RIGHT:
            offsetX = step;
            break;
        case Direction.DOWN:
            offsetY = step;
            break;
        case Direction.LEFT:
            offsetX = -step;
            break;
    }

    return { offsetX, offsetY };
}

function getDataLength(copyDataPiece: ICopyDataPiece) {
    let length = 0;
    for (const t in copyDataPiece) {
        copyDataPiece[t].forEach((item) => {
            length += item.data.length;
        });
    }

    return length;
}
