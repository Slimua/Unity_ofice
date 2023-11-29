import { FormulaEngineService } from '@univerjs/base-formula-engine';
import {
    Direction,
    Disposable,
    ICellData,
    isFormulaString,
    LifecycleStages,
    Nullable,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import {
    APPLY_TYPE,
    AutoFillService,
    DATA_TYPE,
    IAutoFillRule,
    IAutoFillService,
    ICopyDataInTypeIndexInfo,
    ICopyDataPiece,
} from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, FormulaAutoFillController)
export class FormulaAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: AutoFillService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService
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
            match: (cellData) => isFormulaString(cellData?.f),
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
                const originalFormula = data[index]?.f;

                if (originalFormula) {
                    // The first position setting formula and formulaId
                    let formulaId = formulaIdMap.get(index);

                    if (!formulaId) {
                        formulaId = Tools.generateRandomId(6);
                        formulaIdMap.set(index, formulaId);

                        const { offsetX, offsetY } = directionToOffset(step, direction);
                        const shiftedFormula = this._formulaEngineService.moveFormulaRefOffset(
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
