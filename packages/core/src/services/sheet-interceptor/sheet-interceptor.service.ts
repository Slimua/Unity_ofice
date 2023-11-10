import { IDisposable } from '@wendellhu/redi';

import { remove } from '../../common/array';
import { Nullable } from '../../common/type-utils';
import { Disposable, DisposableCollection, toDisposable } from '../../shared/lifecycle';
import { Workbook } from '../../sheets/workbook';
import { Worksheet } from '../../sheets/worksheet';
import { ICellData } from '../../types/interfaces/i-cell-data';
import { ICommandInfo } from '../command/command.service';
import { IUniverInstanceService } from '../instance/instance.service';
import { LifecycleStages, OnLifecycle } from '../lifecycle/lifecycle';
import { IUndoRedoCommandInfos } from '../undoredo/undoredo.service';

/**
 * A helper to compose a certain type of interceptors.
 */
function composeInterceptors<M, T>(interceptors: Array<IInterceptor<M, T>>) {
    // eslint-disable-next-line func-names
    return function (initialValue: Nullable<M>, context: Nullable<T>) {
        let index = -1;

        function passThrough(i: number, v: Nullable<M>): Nullable<M> {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;
            if (i === interceptors.length) {
                return v;
            }

            const interceptor = interceptors[i];

            return interceptor.handler!(v, context, passThrough.bind(null, i + 1));
        }

        return passThrough(0, initialValue);
    };
}

export interface ISheetLocation {
    workbook: Workbook;
    worksheet: Worksheet;
    workbookId: string;
    worksheetId: string;
    row: number;
    col: number;
}

/**
 * Sheet features can provide a `ICellContentInterceptor` to intercept cell content that would be perceived by
 * other features, such as copying, rendering, etc.
 */

export interface IInterceptor<M = unknown, T = unknown> {
    priority?: number;
    handler(value: Nullable<M>, context: Nullable<T>, next: (v: Nullable<M>) => Nullable<M>): Nullable<M>;
}

export interface ICommandInterceptor {
    priority?: number;
    getMutations(command: ICommandInfo): IUndoRedoCommandInfos;
}

export interface ICommandPermissionInterceptor {
    /**
     * This function maybe have side effects ,a pop-up/alert/confirm may be required when the return value is false
     */
    checkPermission(command: ICommandInfo): boolean;
}

export enum INTERCEPTOR_NAMES {
    CELL_CONTENT,
    BEFORE_CELL_EDIT,
    AFTER_CELL_EDIT,
}

/**
 * This class expose methods for sheet features to inject code to sheet underlying logic.
 *
 * It would inject Workbook & Worksheet.
 */
@OnLifecycle(LifecycleStages.Starting, SheetInterceptorService)
export class SheetInterceptorService extends Disposable {
    private _interceptorsByName: Map<INTERCEPTOR_NAMES, IInterceptor[]> = new Map();
    private _commandInterceptors: ICommandInterceptor[] = [];
    private _commandPermissionInterceptor: ICommandPermissionInterceptor[] = [];

    private readonly _workbookDisposables = new Map<string, IDisposable>();
    private readonly _worksheetDisposables = new Map<string, IDisposable>();

    constructor(@IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService) {
        super();

        // When a workbook is created or a worksheet is added after when workbook is created,
        // `SheetInterceptorService` inject interceptors to worksheet instances to it.
        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetAdded$.subscribe((workbook) => {
                    this._interceptWorkbook(workbook);
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._currentUniverService.sheetDisposed$.subscribe((workbook) =>
                    this._disposeWorkbookInterceptor(workbook)
                )
            )
        );

        // register default viewModel interceptor
        this.intercept(INTERCEPTOR_NAMES.CELL_CONTENT, {
            priority: -1,
            handler(content, location: ISheetLocation): Nullable<ICellData> {
                const rawData = location.worksheet.getCellRaw(location.row, location.col);
                if (content) {
                    return { ...rawData, ...content };
                }

                return rawData;
            },
        });
    }

    override dispose(): void {
        super.dispose();

        this._workbookDisposables.forEach((disposable) => disposable.dispose());
        this._workbookDisposables.clear();
        this._worksheetDisposables.clear();
    }

    interceptCommand(interceptor: ICommandInterceptor): IDisposable {
        if (this._commandInterceptors.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }

        this._commandInterceptors.push(interceptor);
        this._commandInterceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        return this.disposeWithMe(toDisposable(() => remove(this._commandInterceptors, interceptor)));
    }

    interceptCommandPermission(interceptor: ICommandPermissionInterceptor): IDisposable {
        if (this._commandPermissionInterceptor.includes(interceptor)) {
            throw new Error('[SheetInterceptorService]: Interceptor already exists!');
        }
        this._commandPermissionInterceptor.push(interceptor);
        return this.disposeWithMe(toDisposable(() => remove(this._commandPermissionInterceptor, interceptor)));
    }

    /**
     * When command is executing, call this method to gether undo redo mutations from upper features.
     * @param command
     * @returns
     */
    onCommandExecute(command: ICommandInfo): IUndoRedoCommandInfos {
        const infos = this._commandInterceptors.map((i) => i.getMutations(command));

        return {
            undos: infos.map((i) => i.undos).flat(),
            redos: infos.map((i) => i.redos).flat(),
        };
    }

    /**
     * Check the permissions of the user when commands will be executed.
     * If one of the return values is false, the command is not executed.
     */
    onCommandPermissionCheck(command: ICommandInfo): boolean {
        const result = this._commandPermissionInterceptor.some((handler) => !handler.checkPermission(command));

        return !result;
    }

    intercept(name: INTERCEPTOR_NAMES, interceptor: IInterceptor) {
        if (!this._interceptorsByName.has(name)) {
            this._interceptorsByName.set(name, []);
        }
        const interceptors = this._interceptorsByName.get(name)!;
        interceptors.push(interceptor);

        this._interceptorsByName.set(
            name,
            interceptors.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        );

        return this.disposeWithMe(toDisposable(() => remove(this._interceptorsByName.get(name)!, interceptor)));
    }

    fetchThroughInterceptors<M, T>(name: INTERCEPTOR_NAMES, initialValue: Nullable<M>, context: Nullable<T>) {
        const interceptors = (this._interceptorsByName.get(name) ?? []) as Array<IInterceptor<M, T>>;

        return composeInterceptors<M, T>(interceptors)(initialValue, context);
    }

    private _interceptWorkbook(workbook: Workbook): void {
        const disposables = new DisposableCollection();
        const workbookId = workbook.getUnitId();
        const self = this;

        const interceptViewModel = (worksheet: Worksheet): void => {
            const worksheetId = worksheet.getSheetId();
            worksheet.__interceptViewModel((viewModel) => {
                const sheetDisposables = new DisposableCollection();
                const cellInterceptorDisposable = viewModel.registerCellContentInterceptor({
                    getCell(row: number, col: number): Nullable<ICellData> {
                        return self.fetchThroughInterceptors(INTERCEPTOR_NAMES.CELL_CONTENT, undefined, {
                            workbookId,
                            worksheetId,
                            row,
                            col,
                            worksheet,
                            workbook,
                        });
                    },
                });
                sheetDisposables.add(cellInterceptorDisposable);
                self._worksheetDisposables.set(getWorksheetDisposableID(workbookId, worksheet), sheetDisposables);
            });
        };

        // We should intercept all instantiated worksheet and should subscribe to
        // worksheet creation event to intercept newly created worksheet.
        workbook.getSheets().forEach((worksheet) => interceptViewModel(worksheet));
        disposables.add(toDisposable(workbook.sheetCreated$.subscribe((worksheet) => interceptViewModel(worksheet))));
        disposables.add(
            toDisposable(
                workbook.sheetDisposed$.subscribe((worksheet) => this._disposeSheetInterceptor(workbookId, worksheet))
            )
        );

        // Dispose all underlying interceptors when workbook is disposed.
        disposables.add(
            toDisposable(() =>
                workbook.getSheets().forEach((worksheet) => this._disposeSheetInterceptor(workbookId, worksheet))
            )
        );
    }

    private _disposeWorkbookInterceptor(workbook: Workbook): void {
        const workbookId = workbook.getUnitId();
        const disposable = this._workbookDisposables.get(workbookId);

        if (disposable) {
            disposable.dispose();
            this._workbookDisposables.delete(workbookId);
        }
    }

    private _disposeSheetInterceptor(workbookId: string, worksheet: Worksheet): void {
        const disposableId = getWorksheetDisposableID(workbookId, worksheet);
        const disposable = this._worksheetDisposables.get(disposableId);

        if (disposable) {
            disposable.dispose();
            this._worksheetDisposables.delete(disposableId);
        }
    }
}

function getWorksheetDisposableID(workbookId: string, worksheet: Worksheet): string {
    return `${workbookId}|${worksheet.getSheetId()}`;
}
