import { Disposable, ICommandService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IMoveRangeCommandParams, MoveRangeCommand } from '../commands/commands/move-range.command';
import { SelectionManagerService } from '../services/selection/selection-manager.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, MoveRangeController)
export class MoveRangeController extends Disposable {
    constructor(
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ICommandService) private readonly _commandService: ICommandService
    ) {
        super();
        this._initialize();
    }

    private _initialize = () => {
        const disposable = new Disposable();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe(() => {
                    // Each range change requires re-listening
                    disposable.dispose();

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposable.disposeWithMe(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe((_toRange) => {
                                    if (!_toRange) {
                                        return;
                                    }

                                    const _fromRange = controlSelection.model.getRange();
                                    const fromRange = {
                                        startRow: _fromRange.startRow,
                                        startColumn: _fromRange.startColumn,
                                        endRow: _fromRange.endRow,
                                        endColumn: _fromRange.endColumn,
                                    };
                                    const toRange = {
                                        startRow: _toRange.startRow,
                                        startColumn: _toRange.startColumn,
                                        endRow: _toRange.endRow,
                                        endColumn: _toRange.endColumn,
                                    };

                                    if (
                                        fromRange.startRow === toRange.startRow &&
                                        fromRange.startColumn === toRange.startColumn
                                    ) {
                                        return;
                                    }

                                    const params: IMoveRangeCommandParams = {
                                        fromRange,
                                        toRange,
                                    };
                                    this._commandService.executeCommand(MoveRangeCommand.id, params);
                                })
                            )
                        );
                    });
                })
            )
        );
    };
}
