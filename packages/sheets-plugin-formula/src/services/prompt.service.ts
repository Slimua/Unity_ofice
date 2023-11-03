import { Direction } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

export interface ISearchItem {
    name: string;
    desc: string;
}

export interface ISearchFunctionParams {
    /**
     * show SearchFunction Component or not
     */
    show: boolean;

    /**
     * function search text
     */
    searchText: string;
}

export interface INavigateParam {
    direction: Direction.UP | Direction.DOWN;
}

export interface IFormulaPromptService {
    /**
     * listen search function open
     */
    search$: Observable<ISearchFunctionParams>;

    /**
     * open search function
     */
    setSearch(param: ISearchFunctionParams): void;

    /**
     * listen help function open
     */
    help$: Observable<boolean>;

    /**
     * open help function
     */

    setHelp(param: boolean): void;

    /**
     * listen navigate shortcut, UP and DOWN
     */
    navigate$: Observable<INavigateParam>;

    /**
     * set navigate shortcut
     */
    setNavigate(param: INavigateParam): void;

    /**
     * listen accept shortcut, TAB/ENTER
     */
    accept$: Observable<boolean>;

    /**
     * set accept shortcut
     */
    setAccept(param: boolean): void;

    /**
     * accept formula name
     */
    acceptFormulaName$: Observable<string>;

    /**
     * set accept formula name
     */
    setAcceptFormulaName(param: string): void;

    dispose(): void;
}

export const IFormulaPromptService = createIdentifier<FormulaPromptService>('univer.formula-prompt-service');

export class FormulaPromptService implements IFormulaPromptService, IDisposable {
    private readonly _search$ = new Subject<ISearchFunctionParams>();

    private readonly _help$ = new Subject<boolean>();

    private readonly _navigate$ = new Subject<INavigateParam>();

    private readonly _accept$ = new Subject<boolean>();

    private readonly _acceptFormulaName$ = new Subject<string>();

    readonly search$ = this._search$.asObservable();

    readonly help$ = this._help$.asObservable();

    readonly navigate$ = this._navigate$.asObservable();

    readonly accept$ = this._accept$.asObservable();

    readonly acceptFormulaName$ = this._acceptFormulaName$.asObservable();

    dispose(): void {
        this._search$.complete();
        this._help$.complete();
        this._navigate$.complete();
        this._accept$.complete();
        this._acceptFormulaName$.complete();
    }

    setSearch(param: ISearchFunctionParams) {
        this._search$.next(param);
    }

    setHelp(param: boolean) {
        this._help$.next(param);
    }

    setNavigate(param: INavigateParam) {
        this._navigate$.next(param);
    }

    setAccept(param: boolean) {
        this._accept$.next(param);
    }

    setAcceptFormulaName(param: string) {
        this._acceptFormulaName$.next(param);
    }
}
