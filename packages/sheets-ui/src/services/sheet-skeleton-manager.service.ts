import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface ISheetSkeletonManagerParam {
    unitId: string;
    sheetId: string;
    skeleton: SpreadsheetSkeleton;
    dirty: boolean;
    commandId?: string;
}

export interface ISheetSkeletonManagerSearch {
    unitId: string;
    sheetId: string;
    commandId?: string;
}

/**
 * This service manages the drawing of the sheet's viewModel (skeleton).
 * Each time there is a content change, it will trigger the viewModel of the render to recalculate.
 * Each application and sub-table has its own viewModel (skeleton).
 * The viewModel is also a temporary storage variable, which does not need to be persisted,
 * so it is managed uniformly through the service.
 */
export class SheetSkeletonManagerService implements IDisposable {
    private _currentSkeleton: ISheetSkeletonManagerSearch = {
        unitId: '',
        sheetId: '',
    };

    private _sheetSkeletonParam: ISheetSkeletonManagerParam[] = [];

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);

    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {}

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._sheetSkeletonParam = [];
    }

    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this._getCurrentBySearch(this._currentSkeleton);
    }

    setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getCurrentBySearch(searchParam);
        if (param != null) {
            this._reCalculate(param);
        } else {
            const { unitId, sheetId } = searchParam;

            const workbook = this._currentUniverService.getUniverSheetInstance(searchParam.unitId);

            const worksheet = workbook?.getSheetBySheetId(searchParam.sheetId);

            if (worksheet == null || workbook == null) {
                return;
            }

            const skeleton = this._buildSkeleton(worksheet, workbook);

            this._sheetSkeletonParam.push({
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeleton = searchParam;

        const nextParam = this.getCurrent();

        this._currentSkeletonBefore$.next(nextParam);

        this._currentSkeleton$.next(nextParam);

        return this.getCurrent();
    }

    reCalculate() {
        const param = this.getCurrent();
        if (param == null) {
            return;
        }
        this._reCalculate(param);
    }

    private _reCalculate(param: ISheetSkeletonManagerParam) {
        if (param.dirty) {
            param.skeleton.makeDirty(true);
            param.dirty = false;
        }
        param.skeleton.calculate();
    }

    makeDirtyCurrent(state: boolean = true) {
        this.makeDirty(this._currentSkeleton, state);
    }

    makeDirty(searchParm: ISheetSkeletonManagerSearch, state: boolean = true) {
        const param = this._getCurrentBySearch(searchParm);
        if (param == null) {
            return;
        }
        param.dirty = state;
    }

    private _getCurrentBySearch(searchParm: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const item = this._sheetSkeletonParam.find(
            (param) => param.unitId === searchParm.unitId && param.sheetId === searchParm.sheetId
        );

        if (item != null) {
            item.commandId = searchParm.commandId;
        }

        return item;
    }

    private _buildSkeleton(worksheet: Worksheet, workbook: Workbook) {
        const config = worksheet.getConfig();
        const spreadsheetSkeleton = SpreadsheetSkeleton.create(
            worksheet,
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles(),
            this._localeService
        );

        return spreadsheetSkeleton;
    }
}
