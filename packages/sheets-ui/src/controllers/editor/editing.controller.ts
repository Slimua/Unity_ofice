import type { Nullable } from '@univerjs/core';
import {
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { getDocObject } from '@univerjs/docs';
import type { ISheetData } from '@univerjs/engine-formula';
import { FormulaEngineService } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

@OnLifecycle(LifecycleStages.Steady, EditingController)
export class EditingController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(IUndoRedoService) private readonly _undoRedoService: IUndoRedoService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialNormalInput();
        this._listenEditorBlur();
    }

    private _listenEditorBlur() {
        this._currentUniverService.currentDoc$.subscribe((docDataModel) => {
            if (docDataModel == null) {
                return;
            }

            const unitId = docDataModel.getUnitId();

            // Clear undo redo stack of cell editor when lose focus.
            if (unitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                this._undoRedoService.clearUndoRedo(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            }
        });
    }

    private _initialNormalInput() {
        /**
         * const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
         * =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
         * =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
         * =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
         * =1+(3*4=4)*5+1
         * =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
         * =lambda(x, y, lambda(x,y, x*lambda(x,y, x*y*x)(x,y))(x,y))(sum(1,2,3), 2)
         * =let(x,5,y,4,sum(x,y)+x))
         * =REDUCE(1, A1:C2, LAMBDA(a,b,a+b^2))
         * =sum(, A1:B1)
         * formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);
         */
        const sheetData: ISheetData = {};
        this._currentUniverService
            .getCurrentUniverSheetInstance()
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
            });

        const formulaData = {
            'workbook-01': {
                'sheet-0011': {
                    9: {
                        8: {
                            f: '=sum(A1:C3)',
                        },
                    },
                    20: {
                        8: {
                            f: '=1+(3*4=4)*5+1',
                        },
                    },
                    22: {
                        8: {
                            f: '=1--1',
                        },
                    },
                    23: {
                        8: {
                            f: '=1--1%',
                        },
                    },
                },
            },
        };

        // this._formulaEngineService
        //     .execute('workbook-01', {
        //         unitData: {
        //             'workbook-01': sheetData,
        //         },
        //         formulaData,
        //         sheetNameMap: {},
        //         forceCalculate: true,
        //         dirtyRanges: [],
        //     })
        //     .then((res) => {
        //         console.log(res.sheetData, res.arrayFormulaData);
        //     });

        // console.log(
        //     'calculate',
        //     this._formulaEngineService.calculate(`=REDUCE(1, 'sheeASDF%#@ASDFt-1'!A:B1, LAMBDA(a,b,a+b^2))`, false)
        // );
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
