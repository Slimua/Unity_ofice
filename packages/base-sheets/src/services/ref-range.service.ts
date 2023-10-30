import {
    Disposable,
    ICommandInfo,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    SheetInterceptorService,
    toDisposable,
} from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';

import {} from '../Basics/Interfaces/MutationInterface';
import {
    IInsertColCommandParams,
    IInsertRowCommandParams,
    InsertColCommand,
    InsertRowCommand,
} from '../commands/commands/insert-row-col.command';
import { IMoveRangeCommandParams, MoveRangeCommand } from '../commands/commands/move-range.command';
import {
    RemoveColCommand,
    RemoveRowColCommandParams,
    RemoveRowCommand,
} from '../commands/commands/remove-row-col.command';

export type EffectParams =
    | ICommandInfo<IMoveRangeCommandParams>
    | ICommandInfo<IInsertRowCommandParams>
    | ICommandInfo<IInsertColCommandParams>
    | ICommandInfo<RemoveRowColCommandParams>;

type RefRangCallback = (params: EffectParams) => {
    redos: Array<ICommandInfo<object>>;
    undos: Array<ICommandInfo<object>>;
};
const keyList = ['startRow', 'startColumn', 'endRow', 'endColumn', 'rangeType'];
const SPLIT_CODE = '_';

/**
 * Collect side effects caused by ref range change
 */
@OnLifecycle(LifecycleStages.Steady, RefRangeService)
export class RefRangeService extends Disposable {
    private _refRangeManagerMap = new Map<string, Map<string, Set<RefRangCallback>>>();
    // todo: range 实例过大的时候
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._onRefRangeChange();
    }
    get worksheetId() {
        return this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    }
    get workbookId() {
        return this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    }
    private _getRefRangId = (workbookId: string, worksheetId: string) => `${workbookId}_${worksheetId}`;
    private _serializeRange = (range: IRange) =>
        keyList.reduce((preValue, currentValue, index) => {
            const value = range[currentValue as keyof IRange];
            if (value !== undefined) {
                return `${preValue}${index > 0 ? SPLIT_CODE : ''}${value}`;
            }
            return `${preValue}`;
        }, '');

    private _deserialize = (rangeString: string) => {
        const map = keyList.reduce(
            (preValue, currentValue, index) => {
                preValue[String(index)] = currentValue;
                return preValue;
            },
            {} as Record<string, string>
        );
        const res = rangeString.split(SPLIT_CODE).reduce(
            (preValue, currentValue, _index) => {
                const index = String(_index) as keyof typeof map;
                if (currentValue && map[index]) {
                    preValue[map[index]] = currentValue;
                }
                return preValue;
            },
            {} as Record<string, string>
        );
        return res as unknown as IRange;
    };
    private _onRefRangeChange = () => {
        this._sheetInterceptorService.interceptCommand({
            getMutations: (command) => {
                command.params;
                const workSheet = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                const workbookId = this.workbookId;
                const worksheetId = this.worksheetId;
                const getEffectsCbList = () => {
                    switch (command.id) {
                        case MoveRangeCommand.id: {
                            const params = command as ICommandInfo<IMoveRangeCommandParams>;
                            return this._checkRange(
                                [params.params!.fromRange, params.params!.toRange],
                                workbookId,
                                worksheetId
                            );
                        }
                        case InsertRowCommand.id: {
                            const params = command as unknown as ICommandInfo<IInsertRowCommandParams>;
                            const rowStart = params.params!.range.startRow;
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case InsertColCommand.id: {
                            const params = command as unknown as ICommandInfo<IInsertColCommandParams>;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case RemoveRowCommand.id: {
                            const params = command as unknown as ICommandInfo<RemoveRowColCommandParams>;
                            const ranges = params.params?.ranges || [];
                            const rowStart = Math.min(...ranges.map((range) => range.startRow));
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case RemoveColCommand.id: {
                            const params = command as unknown as ICommandInfo<RemoveRowColCommandParams>;
                            const ranges = params.params?.ranges || [];
                            const colStart = Math.min(...ranges.map((range) => range.startColumn));
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                    }
                    return [];
                };
                const cbList = getEffectsCbList();
                const result = cbList
                    .map((cb) => cb(command as EffectParams))
                    .reduce(
                        (result, currentValue) => {
                            result.redos.push(...currentValue.redos);
                            result.undos.push(...currentValue.undos);
                            return result;
                        },
                        { redos: [], undos: [] }
                    );
                return result;
            },
        });
    };

    private _checkRange = (effectRanges: IRange[], workbookId: string, worksheetId: string) => {
        const managerId = this._getRefRangId(workbookId, worksheetId);
        const manager = this._refRangeManagerMap.get(managerId);
        if (manager) {
            const callbackSet = new Set<RefRangCallback>();
            // this keyList will to prevent an endless cycle ！！！
            const keyList = [...manager.keys()];

            keyList.forEach((key) => {
                const cbList = manager.get(key);
                const range = this._deserialize(key);
                // Todo@Gggpound : How to reduce this calculation
                if (effectRanges.some((item) => Rectangle.intersects(item, range))) {
                    cbList &&
                        cbList.forEach((callback) => {
                            callbackSet.add(callback);
                        });
                }
            });
            return [...callbackSet];
        }
        return [];
    };

    registerRefRange = (
        range: IRange,
        callback: RefRangCallback,
        _workbookId?: string,
        _worksheetId?: string
    ): IDisposable => {
        const workbookId = _workbookId || this.workbookId;
        const worksheetId = _worksheetId || this.worksheetId;
        const refRangeManageId = this._getRefRangId(workbookId, worksheetId);
        const rangeString = this._serializeRange(range);

        let manager = this._refRangeManagerMap.get(refRangeManageId) as Map<string, Set<RefRangCallback>>;
        if (!manager) {
            manager = new Map();
            this._refRangeManagerMap.set(refRangeManageId, manager);
        }
        const refRangeCallbackList = manager.get(rangeString);

        if (refRangeCallbackList) {
            refRangeCallbackList.add(callback);
        } else {
            manager.set(rangeString, new Set([callback]));
        }
        return toDisposable(() => {
            const refRangeCallbackList = manager.get(rangeString);
            if (refRangeCallbackList) {
                refRangeCallbackList.delete(callback);
                if (!refRangeCallbackList.size) {
                    manager.delete(rangeString);
                    if (!manager.size) {
                        this._refRangeManagerMap.delete(refRangeManageId);
                    }
                }
            }
        });
    };
}
