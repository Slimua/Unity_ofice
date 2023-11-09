import { createIdentifier, IAccessor, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../shared/lifecycle';
import { CommandType, ICommand, ICommandInfo, ICommandService, sequenceExecute } from '../command/command.service';
import { IUniverInstanceService } from '../instance/instance.service';

// TODO: an undo redo element may be merge-able to another undo redo element

export interface IUndoRedoItem {
    /** unitID maps to unitId for UniverSheet / UniverDoc / UniverSlide */
    unitID: string;

    undoMutations: ICommandInfo[];
    redoMutations: ICommandInfo[];

    undo?(mutations: ICommandInfo[]): Promise<boolean> | boolean;
    redo?(mutations: ICommandInfo[]): Promise<boolean> | boolean;
}

export interface IUndoRedoService {
    undoRedoStatus$: Observable<IUndoRedoStatus>;

    pushUndoRedo(item: IUndoRedoItem): void;

    pitchTopUndoElement(): IUndoRedoItem | null;
    pitchTopRedoElement(): IUndoRedoItem | null;

    popUndoToRedo(): void;
    popRedoToUndo(): void;

    clearUndoRedo(unitID: string): void;
}

export interface IUndoRedoCommandInfos {
    undos: ICommandInfo[];
    redos: ICommandInfo[];
}

export const IUndoRedoService = createIdentifier<IUndoRedoService>('univer.undo-redo.service');

export interface IUndoRedoStatus {
    undos: number;
    redos: number;
}

const STACK_CAPACITY = 20;

/**
 * This UndoRedoService is local.
 */
export class LocalUndoRedoService extends Disposable implements IUndoRedoService {
    readonly undoRedoStatus$: Observable<IUndoRedoStatus>;
    protected readonly _undoRedoStatus$ = new BehaviorSubject<{ undos: number; redos: number }>({ undos: 0, redos: 0 });

    protected readonly _undoStacks = new Map<string, IUndoRedoItem[]>();
    protected readonly _redoStacks = new Map<string, IUndoRedoItem[]>();

    constructor(
        @IUniverInstanceService protected readonly _currentUniverSheet: IUniverInstanceService,
        @ICommandService protected readonly _commandService: ICommandService
    ) {
        super();

        this.undoRedoStatus$ = this._undoRedoStatus$.asObservable();

        this.disposeWithMe(this._commandService.registerCommand(UndoCommand));
        this.disposeWithMe(this._commandService.registerCommand(RedoCommand));
        this.disposeWithMe(toDisposable(() => this._undoRedoStatus$.complete()));
        this.disposeWithMe(toDisposable(this._currentUniverSheet.focused$.subscribe(() => this._updateStatus())));
    }

    pushUndoRedo(item: IUndoRedoItem): void {
        const { unitID } = item;

        const redoStack = this._getRedoStack(unitID, true);
        const undoStack = this._getUndoStack(unitID, true);

        // redo stack should be cleared when pushing an undo
        redoStack.length = 0;

        // TODO: undo element maybe merge-able
        // TODO: undo redo stack should have a maximum capacity, maybe we should get the config from IConfigService?
        undoStack.push(item);

        if (undoStack.length > STACK_CAPACITY) {
            undoStack.splice(0, 1);
        }

        // TODO: update status with unitID, the UI doesn't have to update perhaps
        this._updateStatus();
    }

    clearUndoRedo(unitID: string): void {
        const redoStack = this._getRedoStack(unitID);
        if (redoStack) {
            redoStack.length = 0;
        }

        const undoStack = this._getUndoStack(unitID);
        if (undoStack) {
            undoStack.length = 0;
        }

        this._updateStatus();
    }

    pitchTopUndoElement(): IUndoRedoItem | null {
        const undoStack = this._getUndoStackForFocused();

        if (undoStack.length) {
            return undoStack[undoStack.length - 1];
        }

        return null;
    }

    pitchTopRedoElement(): IUndoRedoItem | null {
        const redoStack = this._getRedoStackForFocused();
        if (redoStack.length) {
            return redoStack[redoStack.length - 1];
        }

        return null;
    }

    popUndoToRedo(): void {
        const undoStack = this._getUndoStackForFocused();
        const element = undoStack.pop();
        if (element) {
            const redoStack = this._getRedoStackForFocused();
            redoStack.push(element);
            this._updateStatus();
        }
    }

    popRedoToUndo(): void {
        const redoStack = this._getRedoStackForFocused();
        const element = redoStack.pop();
        if (element) {
            const undoStack = this._getUndoStackForFocused();
            undoStack.push(element);
            this._updateStatus();
        }
    }

    protected _updateStatus(): void {
        const unitID = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        const undos = (unitID && this._undoStacks.get(unitID)?.length) || 0;
        const redos = (unitID && this._redoStacks.get(unitID)?.length) || 0;

        this._undoRedoStatus$.next({
            undos,
            redos,
        });
    }

    protected _getUndoStack(unitId: string): IUndoRedoItem[] | null;
    protected _getUndoStack(unitId: string, createAsNeeded: true): IUndoRedoItem[];
    protected _getUndoStack(unitId: string, createAsNeeded = false): IUndoRedoItem[] | null {
        let stack = this._undoStacks.get(unitId);
        if (!stack && createAsNeeded) {
            stack = [];
            this._undoStacks.set(unitId, stack);
        }

        return stack || null;
    }

    protected _getRedoStack(unitId: string): IUndoRedoItem[] | null;
    protected _getRedoStack(unitId: string, createAsNeeded: true): IUndoRedoItem[];
    protected _getRedoStack(unitId: string, createAsNeeded = false): IUndoRedoItem[] | null {
        let stack = this._redoStacks.get(unitId);
        if (!stack && createAsNeeded) {
            stack = [];
            this._redoStacks.set(unitId, stack);
        }

        return stack || null;
    }

    protected _getUndoStackForFocused(): IUndoRedoItem[] {
        const unitID = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        if (!unitID) {
            throw new Error('No focused univer instance!');
        }

        return this._getUndoStack(unitID, true);
    }

    protected _getRedoStackForFocused(): IUndoRedoItem[] {
        const unitID = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        if (!unitID) {
            throw new Error('No focused univer instance!');
        }

        return this._getRedoStack(unitID, true);
    }
}

abstract class MultiImplementationCommand implements IDisposable {
    dispose(): void {}

    async dispatchToHandlers(): Promise<boolean> {
        return false;
    }
}

export const UndoCommand = new (class extends MultiImplementationCommand implements ICommand {
    readonly type = CommandType.COMMAND;

    readonly id = 'univer.command.undo';

    async handler(accessor: IAccessor) {
        const undoRedoService = accessor.get(IUndoRedoService);
        const element = undoRedoService.pitchTopUndoElement();
        if (!element) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const result = element.undo
            ? await element.undo(element.undoMutations)
            : sequenceExecute(element.undoMutations, commandService);
        if (result) {
            undoRedoService.popUndoToRedo();

            return true;
        }

        return false;
    }
})();

export const RedoCommand = new (class extends MultiImplementationCommand implements ICommand {
    readonly type = CommandType.COMMAND;

    readonly id = 'univer.command.redo';

    async handler(accessor: IAccessor) {
        const undoRedoService = accessor.get(IUndoRedoService);
        const element = undoRedoService.pitchTopRedoElement();
        if (!element) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const result = element.redo
            ? await element.redo(element.redoMutations)
            : sequenceExecute(element.redoMutations, commandService);
        if (result) {
            undoRedoService.popRedoToUndo();

            return true;
        }

        return false;
    }
})();
