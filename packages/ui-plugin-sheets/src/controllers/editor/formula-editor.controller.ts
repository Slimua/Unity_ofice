import type { IRichTextEditingMutationParams, ISetTextSelectionsOperationParams } from '@univerjs/base-docs';
import {
    CoverContentCommand,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
    TextSelectionManagerService,
    VIEWPORT_KEY,
} from '@univerjs/base-docs';
import type { IMouseEvent, IPointerEvent, ITextRangeWithStyle, RenderComponentType } from '@univerjs/base-render';
import { DeviceInputEventType, IRenderManagerService, ScrollBar } from '@univerjs/base-render';
import type { ICommandInfo, IParagraph, Nullable, Observer } from '@univerjs/core';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_EDITOR,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_FORMULA_EDITOR,
    ICommandService,
    IContextService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { type Subscription } from 'rxjs';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { SetEditorResizeOperation } from '../../commands/operations/set-editor-resize.operation';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, FormulaEditorController)
export class FormulaEditorController extends Disposable {
    private _onSheetSelectionSubscription: Nullable<Subscription>;

    private _documentComponent: Nullable<RenderComponentType> = null;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _loadedMap: Set<string> = new Set();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IFormulaEditorManagerService private readonly _formulaEditorManagerService: IFormulaEditorManagerService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._onSheetSelectionSubscription?.unsubscribe();

        if (this._documentComponent) {
            this._documentComponent.onPointerDownObserver.remove(this._downObserver);
        }
    }

    private _initialize() {
        this._syncFormulaEditorContent();
        this._commandExecutedListener();
        this._syncEditorSize();
        this._listenFxBtnClick();

        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return;
            }

            if (!this._loadedMap.has(unitId)) {
                this._initialMain(unitId);
                this._loadedMap.add(unitId);
            }
        });
    }

    private _listenFxBtnClick() {
        this._formulaEditorManagerService.fxBtnClick$.subscribe(() => {
            const isFocusButHidden =
                this._contextService.getContextValue(FOCUSING_EDITOR_BUT_HIDDEN) &&
                !this._contextService.getContextValue(FOCUSING_EDITOR);

            if (isFocusButHidden) {
                this._univerInstanceService.setCurrentUniverDocInstance(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

                this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);

                const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
                    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                );

                const visibleState = this._editorBridgeService.isVisible();
                if (visibleState.visible === false) {
                    this._editorBridgeService.changeVisible({
                        visible: true,
                        eventType: DeviceInputEventType.PointerDown,
                    });
                }

                const content = formulaEditorDataModel?.getBody()?.dataStream;

                if (content == null) {
                    return;
                }

                let newContent = content.startsWith('=') ? content : `=${content}`;

                newContent = newContent.replace(/\r\n$/, '');

                const textRanges: ITextRangeWithStyle[] = [
                    {
                        startOffset: newContent.length,
                        endOffset: newContent.length,
                        collapsed: true,
                    },
                ];

                const coverContentParams = {
                    unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
                    body: {
                        dataStream: newContent,
                    },
                    segmentId: '',
                };

                this._commandService.executeCommand(CoverContentCommand.id, coverContentParams);

                this._textSelectionManagerService.replaceTextRanges(textRanges);
            }
        });
    }

    private _initialMain(unitId: string) {
        const formulaEditorDocObject = this._renderManagerService.getRenderById(unitId);
        if (formulaEditorDocObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = formulaEditorDocObject;

        if (documentComponent == null) {
            return;
        }

        this._documentComponent = documentComponent;

        this._downObserver = documentComponent.onPointerDownObserver.add(() => {
            this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);
            this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

            const visibleState = this._editorBridgeService.isVisible();
            if (visibleState.visible === false) {
                this._editorBridgeService.changeVisible({
                    visible: true,
                    eventType: DeviceInputEventType.PointerDown,
                });
            }
        });
    }

    // Listen to changes in the size of the formula editor container to set the size of the editor.
    private _syncEditorSize() {
        this._formulaEditorManagerService.position$.subscribe((position) => {
            if (position == null) {
                return;
            }
            const editorObject = getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
            const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
                DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
            );

            if (editorObject == null || formulaEditorDataModel == null) {
                return;
            }

            const { width, height } = position;

            const { engine } = editorObject;

            // Update page size when container resized.
            formulaEditorDataModel.updateDocumentDataPageSize(width);

            this._autoScroll();

            // resize canvas
            requestIdleCallback(() => {
                engine.resizeBySize(width, height);
            });
        });
    }

    // Sync cell content to formula editor bar when sheet selection changed.
    private _syncFormulaEditorContent() {
        this._onSheetSelectionSubscription = this._editorBridgeService.state$.subscribe((param) => {
            if (param == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const body = param.documentLayoutObject.documentModel?.getBody();
            const dataStream = body?.dataStream;
            const paragraphs = body?.paragraphs;

            if (dataStream == null || paragraphs == null) {
                return;
            }

            this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, dataStream, paragraphs);

            // Also need to resize document and scene after sync content.
            this._autoScroll();
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (INCLUDE_LIST.includes(unitId)) {
                        // sync cell content to formula editor bar when edit cell editor and vice verse.
                        const editorDocDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
                        const dataStream = editorDocDataModel?.getBody()?.dataStream;
                        const paragraphs = editorDocDataModel?.getBody()?.paragraphs;

                        const syncId =
                            unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                                ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
                                : DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

                        if (dataStream == null || paragraphs == null) {
                            return;
                        }

                        this._syncContentAndRender(syncId, dataStream, paragraphs);

                        // handle weather need to show scroll bar.
                        this._autoScroll();
                    }
                }

                // Mark formula editor as non-focused, when current selection is not in formula editor.
                if (command.id === SetTextSelectionsOperation.id) {
                    const { unitId } = command.params as ISetTextSelectionsOperationParams;
                    if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                        this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, false);
                        this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
                    }
                }
            })
        );
    }

    private _syncContentAndRender(unitId: string, dataStream: string, paragraphs: IParagraph[]) {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        const docsSkeletonObject = this._docSkeletonManagerService.getSkeletonByUnitId(unitId);
        const docDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = this._docViewModelManagerService.getViewModel(unitId);

        if (docDataModel == null || docViewModel == null || docsSkeletonObject == null) {
            return;
        }

        docDataModel.getBody()!.dataStream = dataStream;
        docDataModel.getBody()!.paragraphs = paragraphs;

        docViewModel.reset(docDataModel);

        const { skeleton } = docsSkeletonObject;

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        skeleton.calculate();

        if (INCLUDE_LIST.includes(unitId)) {
            currentRender.mainComponent?.makeDirty();
        }
    }

    private _autoScroll() {
        const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)
            ?.skeleton;
        const position = this._formulaEditorManagerService.getPosition();

        const editorObject = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);

        const formulaEditorDataModel = this._univerInstanceService.getUniverDocInstance(
            DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
        );

        if (skeleton == null || position == null || editorObject == null || formulaEditorDataModel == null) {
            return;
        }

        const { marginTop = 0, marginBottom = 0 } = formulaEditorDataModel.getSnapshot().documentStyle;

        const { scene, mainComponent } = editorObject;

        let { actualHeight } = skeleton.getActualSize();
        // page actual height also need to include page margin top and margin bottom.
        actualHeight += marginTop + marginBottom;

        const { width, height } = position;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (actualHeight > height) {
            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false });
            } else {
                viewportMain?.resetSizeAndScrollBar();
            }
        } else {
            scrollBar = null;
            viewportMain?.scrollTo({ x: 0, y: 0 });
            viewportMain?.getScrollBar()?.dispose();
        }

        scene.transformByState({
            width,
            height: actualHeight,
        });

        mainComponent?.resize(width, actualHeight);
    }
}
