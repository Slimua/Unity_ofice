import {
    DocSkeletonManagerService,
    IRichTextEditingMutationParams,
    NORMAL_TEXT_SELECTION_PLUGIN_NAME,
    RichTextEditingMutation,
    TextSelectionManagerService,
} from '@univerjs/base-docs';
import {
    DeviceInputEventType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentSkeleton,
    IDocumentLayoutObject,
    IEditorInputConfig,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import { IEditorBridgeService } from '@univerjs/base-sheets';
import {
    Disposable,
    DocumentModel,
    ICommandInfo,
    ICommandService,
    IContextService,
    IDocumentBody,
    IDocumentData,
    IPosition,
    ITextRotation,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    Nullable,
    OnLifecycle,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getEditorObject } from '../../Basics/editor/get-editor-object';
import { SHEET_EDITOR_ACTIVATED } from '../../services/context/context';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';

const HIDDEN_EDITOR_POSITION = -1000;

@OnLifecycle(LifecycleStages.Steady, StartEditController)
export class StartEditController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    private _editorVisiblePrevious = false;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialEditFocusListener();
        this._initialStartEdit();
        this._initialKeyboardListener();
    }

    private _initialEditFocusListener() {
        this._editorBridgeService.state$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { unitId, sheetId, position, documentLayoutObject } = param;

            const editorObject = this._getEditorObject();

            if (editorObject == null) {
                return;
            }

            const { document: documentComponent, scene, engine } = editorObject;

            const { startX, startY, endX, endY } = position;

            const { textRotation, verticalAlign, wrapStrategy, documentModel } = documentLayoutObject;

            const { a: angle } = textRotation as ITextRotation;

            documentModel!.updateDocumentId(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);

            const clientWidth = document.body.clientWidth;

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                documentModel!.updateDocumentDataPageSize(endX - startX);
            } else {
                documentModel!.updateDocumentDataPageSize(clientWidth - startX);
            }

            this._currentUniverService.changeDoc(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, documentModel! as DocumentModel);

            const docParam = this._docSkeletonManagerService.updateCurrent({ unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY });

            if (docParam == null) {
                return;
            }

            // const documentSkeleton = DocumentSkeleton.create(documentModel!, this._localService);

            const documentSkeleton = docParam.skeleton;

            // const { actualWidth, actualHeight } = documentSkeleton.getActualSize();

            // let editorWidth = endX - startX;
            // let editorHeight = endY - startY;

            // if (editorWidth < actualWidth) {
            //     editorWidth = actualWidth;
            // }

            // if (editorHeight < actualHeight) {
            //     editorHeight = actualHeight;
            // } else {
            //     let offsetTop = 0;
            //     if (verticalAlign === VerticalAlign.MIDDLE) {
            //         offsetTop = (editorHeight - actualHeight) / 2;
            //     } else if (verticalAlign === VerticalAlign.BOTTOM) {
            //         offsetTop = editorHeight - actualHeight;
            //     }
            //     documentSkeleton.getModel().updateDocumentDataMargin({
            //         t: offsetTop,
            //     });
            //     documentSkeleton.calculate();
            // }

            // engine.resizeBySize(editorWidth, editorHeight);

            // scene.transformByState({
            //     width: editorWidth,
            //     height: editorHeight,
            // });

            documentComponent.changeSkeleton(documentSkeleton);

            // documentComponent.resize(editorWidth, editorHeight);

            this._textSelectionManagerService.setCurrentSelectionNotRefresh({
                pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
                unitId: docParam.unitId,
            });

            this._textSelectionRenderManager.changeRuntime(documentSkeleton, scene);

            this._textSelectionManagerService.replace([
                {
                    cursorStart: 0,
                    cursorEnd: 0,
                    isCollapse: true,
                    isEndBack: true,
                    isStartBack: true,
                },
            ]);
            this._textSelectionRenderManager.active(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
        });
    }

    private _fitTextSize(
        actualRangeWithCoord: IPosition,
        documentSkeleton: DocumentSkeleton,
        documentLayoutObject: IDocumentLayoutObject
    ) {
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { document, scene, engine } = editorObject;

        const { startX, startY, endX, endY } = actualRangeWithCoord;
        const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
        const { textRotation, verticalAlign, wrapStrategy, documentModel } = documentLayoutObject;
        let editorWidth = endX - startX;
        let editorHeight = endY - startY;

        if (editorWidth < actualWidth) {
            editorWidth = actualWidth;
        }

        if (editorHeight < actualHeight) {
            editorHeight = actualHeight;
        } else {
            let offsetTop = 0;
            if (verticalAlign === VerticalAlign.MIDDLE) {
                offsetTop = (editorHeight - actualHeight) / 2;
            } else if (verticalAlign === VerticalAlign.BOTTOM) {
                offsetTop = editorHeight - actualHeight;
            }
            documentSkeleton.getModel().updateDocumentDataMargin({
                t: offsetTop,
            });
            documentSkeleton.calculate();
        }

        engine.resizeBySize(editorWidth, editorHeight);

        scene.transformByState({
            width: editorWidth,
            height: editorHeight,
        });

        // document.changeSkeleton(documentSkeleton);

        document.resize(editorWidth, editorHeight);

        this._cellEditorManagerService.setState({
            startX,
            startY,
            endX: editorWidth + startX,
            endY: editorHeight + startY,
            show: true,
        });

        this._textSelectionRenderManager.sync();
    }

    private _initialStartEdit() {
        this._editorBridgeService.visible$.subscribe((state) => {
            if (state.visible === this._editorVisiblePrevious) {
                return;
            }

            this._editorVisiblePrevious = state.visible;

            if (state.visible === false) {
                this._contextService.setContextValue(SHEET_EDITOR_ACTIVATED, false);
                this._cellEditorManagerService.setState({
                    show: state.visible,
                });
                return;
            }

            const param = this._editorBridgeService.getState();
            if (param == null) {
                return;
            }

            const { position, documentLayoutObject } = param;

            const editorObject = this._getEditorObject();

            if (editorObject == null) {
                return;
            }

            const { document } = editorObject;

            // const { startX, startY, endX, endY } = position;

            this._contextService.setContextValue(SHEET_EDITOR_ACTIVATED, true);
            // this._cellEditorManagerService.setState({
            //     startX,
            //     startY,
            //     endX,
            //     endY,
            //     show: state.visible,
            // });

            const docParam = this._docSkeletonManagerService.getCurrent();

            if (docParam == null) {
                return;
            }

            const { skeleton } = docParam;

            const documentModel = skeleton.getModel() as DocumentModel;

            this._fitTextSize(position, skeleton, documentLayoutObject);

            // move selection
            if (state.eventType === DeviceInputEventType.Keyboard) {
                const snapshot = Tools.deepClone(documentModel.snapshot) as IDocumentData;
                this._resetBodyStyle(snapshot.body!);

                documentModel.reset(snapshot);

                document.makeDirty();

                // skeleton.calculate();
                this._textSelectionManagerService.replace([
                    {
                        cursorStart: 0,
                        cursorEnd: 0,
                        isCollapse: true,
                        isEndBack: true,
                        isStartBack: true,
                    },
                ]);
            } else {
                const cursor = documentModel.getBodyModel().getLastIndex() - 1 || 0;

                this._textSelectionManagerService.replace([
                    {
                        cursorStart: cursor,
                        cursorEnd: cursor,
                        isCollapse: true,
                        isEndBack: true,
                        isStartBack: true,
                    },
                ]);
            }

            setTimeout(() => {
                this._textSelectionRenderManager.sync();
            }, 0);
        });
    }

    private _resetBodyStyle(body: IDocumentBody) {
        body.dataStream = `\r\n`;

        if (body.textRuns != null) {
            if (body.textRuns.length === 1) {
                body.textRuns[0].st = 0;
                body.textRuns[0].ed = 1;
            } else {
                body.textRuns = undefined;
            }
        }

        if (body.paragraphs != null) {
            if (body.paragraphs.length === 1) {
                body.paragraphs[0].startIndex = 0;
            } else {
                body.paragraphs = [
                    {
                        startIndex: 0,
                    },
                ];
            }
        }

        if (body.sectionBreaks != null) {
            body.sectionBreaks = undefined;
        }

        if (body.tables != null) {
            body.tables = undefined;
        }

        if (body.customRanges != null) {
            body.customRanges = undefined;
        }

        if (body.customBlocks != null) {
            body.customBlocks = undefined;
        }
    }

    private _initialKeyboardListener() {
        this._textSelectionRenderManager.onInput$.subscribe(this._showEditorByKeyboard.bind(this));
        this._textSelectionRenderManager.onCompositionstart$.subscribe(this._showEditorByKeyboard.bind(this));
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>) {
        if (config == null) {
            return;
        }
        // const { event, content, activeRange, selectionList } = config;

        this._editorBridgeService.show(DeviceInputEventType.Keyboard);
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        const excludeUnitList = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;

                    const docsSkeletonObject = this._docSkeletonManagerService.getCurrent();

                    if (docsSkeletonObject == null) {
                        return;
                    }

                    const { unitId, skeleton } = docsSkeletonObject;

                    if (commandUnitId !== unitId) {
                        return;
                    }

                    const currentRender = this._renderManagerService.getRenderById(unitId);

                    if (currentRender == null) {
                        return;
                    }

                    if (!excludeUnitList.includes(unitId)) {
                        return;
                    }

                    const param = this._editorBridgeService.getState();
                    if (param == null) {
                        return;
                    }

                    const { position, documentLayoutObject } = param;

                    this._fitTextSize(position, skeleton, documentLayoutObject);
                }
            })
        );
    }

    private _getEditorObject() {
        return getEditorObject(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }

    private _getFormulaBarEditorObject() {
        return getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }
}
