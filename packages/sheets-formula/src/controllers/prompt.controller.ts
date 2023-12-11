/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo, IRangeWithCoord, ITextRun, Nullable } from '@univerjs/core';
import {
    deserializeRangeWithSheet,
    Direction,
    Disposable,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_EDITOR_INPUT_FORMULA,
    ICommandService,
    IContextService,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    serializeRangeToRefString,
    ThemeService,
    toDisposable,
    Tools,
} from '@univerjs/core';
import {
    DocViewModelManagerService,
    MoveCursorOperation,
    ReplaceContentCommand,
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { ISequenceNode } from '@univerjs/engine-formula';
import {
    generateStringWithSequence,
    includeFormulaLexerToken,
    isFormulaLexerToken,
    LexerTreeBuilder,
    matchToken,
    normalizeSheetName,
    sequenceNodeType,
} from '@univerjs/engine-formula';
import {
    DeviceInputEventType,
    getCellInfoInMergeData,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
} from '@univerjs/sheets';
import type { EditorBridgeService, SelectionShape } from '@univerjs/sheets-ui';
import {
    ExpandSelectionCommand,
    getEditorObject,
    IEditorBridgeService,
    ISelectionRenderService,
    JumpOver,
    MoveSelectionCommand,
    SetEditorResizeOperation,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import type { ISelectEditorFormulaOperationParam } from '../commands/operations/editor-formula.operation';
import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { META_KEY_CTRL_AND_SHIFT } from '../common/prompt';
import { FORMULA_REF_SELECTION_PLUGIN_NAME, getFormulaRefSelectionStyle } from '../common/selection';
import { IDescriptionService } from '../services/description.service';
import { IFormulaInputService } from '../services/formula-input.service';
import { IFormulaPromptService } from '../services/prompt.service';

interface IRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
}

enum ArrowMoveAction {
    InitialState,
    moveCursor,
    moveRefReady,
    movingRef,
    exitInput,
}

enum InputPanelState {
    InitialState,
    keyNormal,
    keyArrow,
    mouse,
}

@OnLifecycle(LifecycleStages.Steady, PromptController)
export class PromptController extends Disposable {
    private _formulaRefColors: string[] = [];

    private _previousSequenceNodes: Nullable<Array<string | ISequenceNode>>;

    private _previousRangesCount: number = 0;

    private _previousInsertRefStringIndex: Nullable<number>;

    private _currentInsertRefStringIndex: number = -1;

    private _currentUnitId: Nullable<string>;

    private _currentSheetId: Nullable<string>;

    private _arrowMoveActionState: ArrowMoveAction = ArrowMoveAction.InitialState;

    private _isSelectionMovingRefSelections: IRefSelection[] = [];

    private _stringColor = '';

    private _numberColor = '';

    private _insertSelections: ISelectionWithStyle[] = [];

    private _inputPanelState: InputPanelState = InputPanelState.InitialState;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IFormulaInputService private readonly _formulaInputService: IFormulaInputService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._formulaRefColors = [];
        this._resetTemp();
    }

    private _resetTemp() {
        this._previousSequenceNodes = null;

        this._previousInsertRefStringIndex = null;

        this._currentUnitId = null;

        this._currentSheetId = null;

        this._isSelectionMovingRefSelections = [];

        this._previousRangesCount = 0;

        this._currentInsertRefStringIndex = -1;
    }

    private _initialize(): void {
        this._initialCursorSync();

        this._initAcceptFormula();

        this._initialFormulaTheme();

        this._initialRefSelectionUpdateEvent();

        this._initialRefSelectionInsertEvent();

        this._initialExitEditor();

        this._initialEditorInputChange();

        this._commandExecutedListener();

        this._cursorStateListener();

        this._syncEditorListener();
    }

    private _initialFormulaTheme() {
        const style = this._themeService.getCurrentTheme();

        this._formulaRefColors = [
            style.loopColor1,
            style.loopColor2,
            style.loopColor3,
            style.loopColor4,
            style.loopColor5,
            style.loopColor6,
            style.loopColor7,
            style.loopColor8,
            style.loopColor9,
            style.loopColor10,
            style.loopColor11,
            style.loopColor12,
        ];

        this._numberColor = style.hyacinth700;

        this._stringColor = style.verdancy800;
    }

    private _initialCursorSync() {
        this.disposeWithMe(
            toDisposable(
                this._textSelectionManagerService.textSelection$.subscribe(() => {
                    if (
                        this._editorBridgeService.isVisible().visible === false ||
                        this._formulaInputService.isSelectionMoving()
                    ) {
                        return;
                    }

                    const currentBody = this._getCurrentBody();

                    const dataStream = currentBody?.dataStream || '';

                    this._contextSwitch(dataStream);

                    this._changeKeepVisibleHideState();

                    this._switchSelectionPlugin();

                    if (this._formulaInputService.isLockedSelectionChange()) {
                        return;
                    }

                    this._highlightFormula();

                    // if (this._isLockedOnSelectionInsertRefString) {
                    //     return;
                    // }
                    // TODO@Dushusir: use real text info
                    this._changeFunctionPanelState();
                })
            )
        );
    }

    private _initialEditorInputChange() {
        this.disposeWithMe(
            toDisposable(
                this._textSelectionRenderManager.onInputBefore$.subscribe((param) => {
                    this._previousSequenceNodes = null;
                    this._previousInsertRefStringIndex = null;

                    this._selectionRenderService.enableSkipRemainLast();

                    const e = param?.event as KeyboardEvent;
                    if (e == null) {
                        return;
                    }
                    if (
                        ![KeyCode.ARROW_DOWN, KeyCode.ARROW_UP, KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT].includes(
                            e.which
                        )
                    ) {
                        if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                            this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
                        }
                        this._inputPanelState = InputPanelState.keyNormal;
                    } else {
                        this._inputPanelState = InputPanelState.keyArrow;
                    }
                })
            )
        );
    }

    private _initialExitEditor() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.afterVisible$.subscribe((visibleParam) => {
                    if (visibleParam.visible === true) {
                        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

                        if (this._currentUnitId == null) {
                            this._currentUnitId = unitId;
                        }

                        if (this._currentSheetId == null) {
                            this._currentSheetId = sheetId;
                        }

                        return;
                    }

                    /**
                     * Switching the selection of PluginName causes a refresh.
                     * Here, a delay is added to prevent the loss of content when pressing enter.
                     */

                    const current = this._selectionManagerService.getCurrent();

                    if (current?.pluginName === NORMAL_SELECTION_PLUGIN_NAME) {
                        this._disableForceKeepVisible();
                        return;
                    }

                    this._selectionManagerService.clear();
                    this._selectionManagerService.changePlugin(NORMAL_SELECTION_PLUGIN_NAME);

                    this._updateEditorModel('\r\n', []);

                    this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

                    this._disableForceKeepVisible();

                    this._selectionRenderService.resetStyle();

                    this._resetTemp();

                    this._hideFunctionPanel();
                })
            )
        );
    }

    private _initialRefSelectionUpdateEvent() {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    this._formulaInputService.disableSelectionMoving();

                    if (current?.pluginName !== FORMULA_REF_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    this._updateRefSelectionStyle(this._isSelectionMovingRefSelections);

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        controlSelection.disableHelperSelection();

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoving$.subscribe((toRange) => {
                                    this._changeControlSelection(toRange, controlSelection);
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaling$.subscribe((toRange) => {
                                    this._changeControlSelection(toRange, controlSelection);
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe(() => {
                                    this._formulaInputService.disableLockedSelectionChange();
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaled$.subscribe(() => {
                                    this._formulaInputService.disableLockedSelectionChange();
                                })
                            )
                        );
                    });
                })
            )
        );
    }

    private _syncEditorListener() {
        this.disposeWithMe(
            toDisposable(
                this._formulaInputService.syncToEditor$.subscribe((param) => {
                    const { sequences, textSelectionOffset } = param;
                    this._syncToEditor(sequences, textSelectionOffset);
                })
            )
        );
    }

    private _selectionChanging(selectionWithStyles: ISelectionWithStyle[], isSync: boolean = false) {
        if (selectionWithStyles.length === 0) {
            return;
        }

        if (!this._formulaInputService.isLockedSelectionInsert()) {
            return;
        }

        this._formulaInputService.enableSelectionMoving();

        this._inertControlSelection(selectionWithStyles);

        if (isSync === false) {
            return;
        }
        const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];
        this._inertControlSelectionReplace(currentSelection);
    }

    private _initialRefSelectionInsertEvent() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoving$.subscribe((selectionWithCoordAndStyles) => {
                    this._selectionChanging(
                        selectionWithCoordAndStyles.map((selectionDataWithStyle) =>
                            convertSelectionDataToRange(selectionDataWithStyle)
                        )
                    );
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoveStart$.subscribe((selectionWithCoordAndStyles) => {
                    this._selectionChanging(
                        selectionWithCoordAndStyles.map((selectionDataWithStyle) =>
                            convertSelectionDataToRange(selectionDataWithStyle)
                        ),
                        true
                    );
                })
            )
        );
    }

    private _initAcceptFormula() {
        this.disposeWithMe(
            toDisposable(
                this._formulaPromptService.acceptFormulaName$.subscribe((formulaString: string) => {
                    const activeRange = this._textSelectionManagerService.getActiveRange();

                    if (activeRange == null) {
                        this._hideFunctionPanel();
                        return;
                    }

                    const { startOffset } = activeRange;

                    const lastSequenceNodes = this._formulaInputService.getSequenceNodes();

                    const nodeIndex = this._formulaInputService.getCurrentSequenceNodeIndex(startOffset - 2);

                    const node = lastSequenceNodes[nodeIndex];

                    if (node == null || typeof node === 'string') {
                        this._hideFunctionPanel();
                        return;
                    }

                    const difference = formulaString.length - node.token.length;

                    // node.token = formulaString;

                    // node.endIndex += difference;

                    const newNode = { ...node };

                    newNode.token = formulaString;

                    newNode.endIndex += difference;

                    lastSequenceNodes[nodeIndex] = newNode;

                    lastSequenceNodes.splice(nodeIndex + 1, 0, matchToken.OPEN_BRACKET);

                    const formulaStringCount = formulaString.length + 1;

                    for (let i = nodeIndex + 2, len = lastSequenceNodes.length; i < len; i++) {
                        const node = lastSequenceNodes[i];
                        if (typeof node === 'string') {
                            continue;
                        }

                        // node.startIndex += formulaStringCount;
                        // node.endIndex += formulaStringCount;

                        const newNode = { ...node };

                        newNode.startIndex += formulaStringCount;
                        newNode.endIndex += formulaStringCount;

                        lastSequenceNodes[i] = newNode;
                    }

                    this._syncToEditor(lastSequenceNodes, newNode.endIndex + 2);
                })
            )
        );
    }

    private _changeFunctionPanelState() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            this._hideFunctionPanel();
            return;
        }

        const { startOffset } = activeRange;

        const currentSequenceNode = this._formulaInputService.getCurrentSequenceNode(startOffset - 2);

        if (currentSequenceNode == null) {
            this._hideFunctionPanel();
            return;
        }

        if (typeof currentSequenceNode !== 'string' && currentSequenceNode.nodeType === sequenceNodeType.FUNCTION) {
            const token = currentSequenceNode.token.toUpperCase();

            if (this._inputPanelState === InputPanelState.keyNormal) {
                // show search function panel
                const searchList = this._descriptionService.getSearchListByName(token);
                this._hideFunctionPanel();
                if (searchList == null || searchList.length === 0) {
                    return;
                }
                this._commandService.executeCommand(SearchFunctionOperation.id, {
                    visible: true,
                    searchText: token,
                    searchList,
                });
            } else if (this._descriptionService.hasFunction(token)) {
                // show help function panel
                this._changeHelpFunctionPanelState(token, -1);
            }

            return;
        }

        const currentBody = this._getCurrentBody();

        const dataStream = currentBody?.dataStream || '';

        const functionAndParameter = this._lexerTreeBuilder.getFunctionAndParameter(dataStream, startOffset - 1);

        if (functionAndParameter == null) {
            this._hideFunctionPanel();
            return;
        }

        const { functionName, paramIndex } = functionAndParameter;

        this._changeHelpFunctionPanelState(functionName.toUpperCase(), paramIndex);
    }

    private _changeHelpFunctionPanelState(token: string, paramIndex: number) {
        const functionInfo = this._descriptionService.getFunctionInfo(token);
        this._hideFunctionPanel();
        if (functionInfo == null) {
            return;
        }

        // show help function panel
        this._commandService.executeCommand(HelpFunctionOperation.id, {
            visible: true,
            paramIndex,
            functionInfo,
        });
    }

    private _hideFunctionPanel() {
        this._commandService.executeCommand(SearchFunctionOperation.id, {
            visible: false,
            searchText: '',
        });
        this._commandService.executeCommand(HelpFunctionOperation.id, {
            visible: false,
            paramIndex: -1,
        });
    }

    /**
     * If the cursor is located at a formula token,
     * it is necessary to prohibit the behavior of closing the editor by clicking on the canvas,
     * in order to generate reference text for the formula.
     */
    private _changeKeepVisibleHideState() {
        if (this._getContextState() === false) {
            this._disableForceKeepVisible();
            return;
        }

        const char = this._getCurrentChar();

        if (char == null) {
            this._disableForceKeepVisible();
            return;
        }

        if (this._matchRefDrawToken(char)) {
            this._editorBridgeService.enableForceKeepVisible();

            this._formulaInputService.enableLockedSelectionInsert();

            this._selectionRenderService.enableRemainLast();

            if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
            }
        } else {
            this._disableForceKeepVisible();
        }
    }

    /**
     * Determine whether the character is a token keyword for the formula engine.
     * @param char
     * @returns
     */
    private _matchRefDrawToken(char: string) {
        return (
            (isFormulaLexerToken(char) &&
                char !== matchToken.CLOSE_BRACES &&
                char !== matchToken.CLOSE_BRACKET &&
                char !== matchToken.SINGLE_QUOTATION &&
                char !== matchToken.DOUBLE_QUOTATION) ||
            char === ' '
        );
    }

    /**
     *
     * @returns Return the character under the current cursor in the editor.
     */
    private _getCurrentChar() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { startOffset } = activeRange;

        const body = this._getCurrentBody();

        if (body == null || startOffset == null) {
            return;
        }

        const dataStream = body.dataStream;

        return dataStream[startOffset - 1];
    }

    /**
     * Disable the ref string generation mode. In the ref string generation mode,
     * users can select a certain area using the mouse and arrow keys, and convert the area into a ref string.
     */
    private _disableForceKeepVisible() {
        this._editorBridgeService.disableForceKeepVisible();

        this._formulaInputService.disableLockedSelectionInsert();

        this._currentInsertRefStringIndex = -1;
        this._selectionRenderService.disableRemainLast();

        if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
            this._arrowMoveActionState = ArrowMoveAction.exitInput;
        }
    }

    private _getCurrentBody() {
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null) {
            return;
        }
        const documentModel = this._currentUniverService.getUniverDocInstance(editorUnitId);
        return documentModel?.snapshot?.body;
    }

    private _getFormulaAndCellEditorBody() {
        const unitIds = [DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

        return unitIds.map((unitId) => {
            const dataModel = this._currentUniverService.getUniverDocInstance(unitId);

            return dataModel?.getBody();
        });
    }

    /**
     * Detect whether the user's input content is a formula. If it is a formula,
     * serialize the current input content into a sequenceNode;
     * otherwise, close the formula panel.
     * @param currentInputValue The text content entered by the user in the editor.
     * @returns
     */
    private _contextSwitch(currentInputValue: string) {
        if (isFormulaString(currentInputValue)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);

            const lastSequenceNodes =
                this._lexerTreeBuilder.sequenceNodesBuilder(currentInputValue.replace(/\r/g, '').replace(/\n/g, '')) ||
                [];

            this._formulaInputService.setSequenceNodes(lastSequenceNodes);

            const activeRange = this._textSelectionManagerService.getActiveRange();

            if (activeRange == null) {
                return;
            }

            const { startOffset } = activeRange;

            this._currentInsertRefStringIndex = startOffset - 1;
        } else {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

            this._formulaInputService.disableLockedSelectionChange();

            this._formulaInputService.disableLockedSelectionInsert();

            // this._lastSequenceNodes = [];

            this._formulaInputService.clearSequenceNodes();

            this._hideFunctionPanel();
        }
    }

    private _getContextState() {
        return this._contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA);
    }

    /**
     * Switch from formula selection state to regular selection state.
     */
    private _switchSelectionPlugin() {
        if (this._getContextState() === true) {
            this._selectionManagerService.changePluginNoRefresh(FORMULA_REF_SELECTION_PLUGIN_NAME);
            // const selections = this._selectionManagerService.getSelections();
            // if (selections == null || selections.length === 0) {
            //     const selectionData = this._selectionManagerService.getLastByPlugin(NORMAL_SELECTION_PLUGIN_NAME);
            //     if (selectionData != null) {
            //         this._selectionManagerService.add([Tools.deepClone(selectionData)]);
            //     }
            // }

            const style = getNormalSelectionStyle(this._themeService);
            style.strokeDash = 8;
            style.hasAutoFill = false;
            style.hasRowHeader = false;
            style.hasColumnHeader = false;
            this._selectionRenderService.setStyle(style);
        } else {
            this._selectionManagerService.changePluginNoRefresh(NORMAL_SELECTION_PLUGIN_NAME);
            this._selectionRenderService.resetStyle();
        }
    }

    /**
     * Highlight cell editor and formula bar editor.
     */
    private _highlightFormula() {
        if (this._getContextState() === false) {
            return;
        }

        // const dataStream = body.dataStream;

        // const sequenceNodes = this._lexerTreeBuilder.buildSequenceNodes(
        //     dataStream.replace(/\r/g, '').replace(/\n/g, '')
        // );

        const sequenceNodes = this._formulaInputService.getSequenceNodes();
        const bodyList = this._getFormulaAndCellEditorBody().filter((b) => !!b);

        this._selectionManagerService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            bodyList.forEach((body) => (body!.textRuns = []));
        } else {
            // this._lastSequenceNodes = sequenceNodes;
            const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);
            bodyList.forEach((body) => (body!.textRuns = textRuns));

            this._refreshSelectionForReference(refSelections);
        }

        this._refreshFormulaAndCellEditor();
    }

    /**
     * :
     * #
     * Generate styles for formula text, highlighting references, text, numbers, and arrays.
     * @returns
     */
    private _buildTextRuns(sequenceNodes: Array<ISequenceNode | string>) {
        const textRuns: ITextRun[] = [];
        const refSelections: IRefSelection[] = [];
        let refColorIndex = 0;

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const { startIndex, endIndex, nodeType, token } = node;
            let themeColor = '';
            if (nodeType === sequenceNodeType.REFERENCE) {
                const colorIndex = refColorIndex % this._formulaRefColors.length;
                themeColor = this._formulaRefColors[colorIndex];

                refSelections.push({
                    refIndex: i,
                    themeColor,
                    token,
                });

                refColorIndex++;
            } else if (nodeType === sequenceNodeType.NUMBER) {
                themeColor = this._numberColor;
            } else if (nodeType === sequenceNodeType.STRING) {
                themeColor = this._stringColor;
            } else if (nodeType === sequenceNodeType.ARRAY) {
                themeColor = this._stringColor;
            }

            if (themeColor && themeColor.length > 0) {
                textRuns.push({
                    st: startIndex + 1,
                    ed: endIndex + 2,
                    ts: {
                        cl: {
                            rgb: themeColor,
                        },
                    },
                });
            }
        }

        // console.log('sequenceNodes', sequenceNodes, textRuns);

        return { textRuns, refSelections };
    }

    /**
     * Draw the referenced selection text based on the style and token.
     * @param refSelections
     * @returns
     */
    private _refreshSelectionForReference(refSelections: IRefSelection[]) {
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        const selectionWithStyle: ISelectionWithStyle[] = [];

        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(sheetId);

        if (worksheet == null) {
            return;
        }

        let lastRange: Nullable<ISelectionWithStyle> = null;

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const gridRange = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range } = gridRange;

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (sheetName.length !== 0 && refSheetId !== sheetId) {
                continue;
            }

            const primary = this._insertSelections.find((selection) => {
                const { startRow, startColumn, endRow, endColumn } = selection.range;
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    endRow === range.endRow &&
                    endColumn === range.endColumn
                ) {
                    return true;
                }
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    range.startRow === range.endRow &&
                    range.startColumn === range.endColumn
                ) {
                    return true;
                }

                return false;
            })?.primary;

            if (primary != null) {
                const {
                    isMerged,
                    isMergedMainCell,
                    startRow: mergeStartRow,
                    endRow: mergeEndRow,
                    startColumn: mergeStartColumn,
                    endColumn: mergeEndColumn,
                } = primary;

                if (
                    (isMerged || isMergedMainCell) &&
                    mergeStartRow === range.startRow &&
                    mergeStartColumn === range.startColumn &&
                    range.startRow === range.endRow &&
                    range.startColumn === range.endColumn
                ) {
                    range.endRow = mergeEndRow;
                    range.endColumn = mergeEndColumn;
                }

                lastRange = {
                    range,
                    primary,
                    style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
                };

                continue;
            }

            selectionWithStyle.push({
                range,
                primary,
                style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
            });
        }

        if (lastRange) {
            selectionWithStyle.push(lastRange);
        }

        if (selectionWithStyle.length === 0) {
            return;
        }

        this._selectionManagerService.add(selectionWithStyle);
    }

    private _getSheetIdByName(unitId: string, sheetName: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        return workbook?.getSheetBySheetName(normalizeSheetName(sheetName))?.getSheetId();
    }

    private _getSheetNameById(unitId: string, sheetId: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        let sheetName = workbook?.getSheetBySheetId(sheetId)?.getName() || '';

        if (sheetName.length > 0 && includeFormulaLexerToken(sheetName)) {
            sheetName = `'${sheetName}'`;
        }

        return sheetName;
    }

    private _getCurrentUnitIdAndSheetId() {
        const current = this._sheetSkeletonManagerService.getCurrent();

        if (current == null) {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            return {
                unitId: workbook.getUnitId(),
                sheetId: worksheet.getSheetId(),
            };
        }

        const { unitId, sheetId, skeleton } = current;

        return {
            unitId,
            sheetId,
            skeleton,
        };
    }

    /**
     * Convert the selection range to a ref string for the formula engine, such as A1:B1
     * @param range
     * @returns
     */
    private _getRefString(currentSelection: ISelectionWithStyle) {
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        let refUnitId = '';
        let refSheetName = '';

        if (unitId === this._currentUnitId) {
            refUnitId = '';
        } else {
            refUnitId = unitId;
        }

        if (sheetId === this._currentSheetId) {
            refSheetName = '';
        } else {
            refSheetName = this._getSheetNameById(unitId, sheetId);
        }

        const { range, primary } = currentSelection;

        let { startRow, endRow, startColumn, endColumn } = range;

        if (primary) {
            const {
                isMerged,
                isMergedMainCell,
                startRow: mergeStartRow,
                endRow: mergeEndRow,
                startColumn: mergeStartColumn,
                endColumn: mergeEndColumn,
            } = primary;

            if (
                (isMerged || isMergedMainCell) &&
                mergeStartRow === startRow &&
                mergeStartColumn === startColumn &&
                mergeEndRow === endRow &&
                mergeEndColumn === endColumn
            ) {
                startRow = mergeStartRow;
                startColumn = mergeStartColumn;
                endRow = mergeStartRow;
                endColumn = mergeStartColumn;
            }
        }

        return serializeRangeToRefString({
            sheetName: refSheetName,
            unitId: refUnitId,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
        });
    }

    /**
     * Restore the sequenceNode generated by the lexer to the text in the editor, and set the cursor position.
     * @param sequenceNodes
     * @param textSelectionOffset
     * @returns
     */
    private async _syncToEditor(
        sequenceNodes: Array<string | ISequenceNode>,
        textSelectionOffset: number,
        canUndo: boolean = true
    ) {
        const dataStream = generateStringWithSequence(sequenceNodes);

        const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);

        this._isSelectionMovingRefSelections = refSelections;

        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { collapsed, style } = activeRange;

        this._currentInsertRefStringIndex = textSelectionOffset;

        await this._fitEditorSize();

        if (canUndo) {
            this._commandService.executeCommand(ReplaceContentCommand.id, {
                unitId: this._editorBridgeService.getCurrentEditorId(),
                body: {
                    dataStream: `=${dataStream}`,
                    textRuns,
                },
                textRanges: [
                    {
                        startOffset: textSelectionOffset + 1,
                        endOffset: textSelectionOffset + 1,
                        collapsed,
                        style,
                    },
                ],
                segmentId: null,
            });
        } else {
            this._updateEditorModel(`=${dataStream}\r\n`, textRuns);
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: textSelectionOffset + 1,
                    endOffset: textSelectionOffset + 1,
                    style,
                },
            ]);
        }
    }

    private async _fitEditorSize() {
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null) {
            return;
        }

        await this._commandService.syncExecuteCommand(SetEditorResizeOperation.id, {
            unitId: editorUnitId,
        });
    }

    /**
     * Update the editor's model value to facilitate formula updates.
     * @param dataStream
     * @param textRuns
     * @returns
     */
    private _updateEditorModel(dataStream: string, textRuns: ITextRun[]) {
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null) {
            return;
        }
        const documentDataModel = this._currentUniverService.getUniverDocInstance(editorUnitId);
        const docViewModel = this._docViewModelManagerService.getViewModel(editorUnitId);
        if (docViewModel == null || documentDataModel == null) {
            return;
        }

        const snapshot = documentDataModel?.getSnapshot();

        if (snapshot == null) {
            return;
        }

        const newBody = {
            dataStream,
            textRuns,
        };

        snapshot.body = newBody;

        docViewModel.reset(documentDataModel);
    }

    private _inertControlSelectionReplace(currentSelection: ISelectionWithStyle) {
        if (this._previousSequenceNodes == null) {
            this._previousSequenceNodes = this._formulaInputService.getSequenceNodes();
        }

        if (this._previousInsertRefStringIndex == null) {
            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;
        }

        // No new control is added, the current ref string is still modified.
        const insertNodes = Tools.deepClone(this._previousSequenceNodes);
        if (insertNodes == null) {
            return;
        }

        const refString = this._getRefString(currentSelection);

        this._formulaInputService.setSequenceNodes(insertNodes);

        this._formulaInputService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

        this._syncToEditor(insertNodes, this._previousInsertRefStringIndex + refString.length);

        const selectionDatas = this._selectionRenderService.getSelectionDataWithStyle();

        this._insertSelections = [];

        selectionDatas.forEach((currentSelection) => {
            const range = convertSelectionDataToRange(currentSelection);
            this._insertSelections.push(range);
        });

        // const currentSelection = selectionDatas[selectionDatas.length - 1];

        // if (currentSelection.primaryWithCoord != null) {
        //     this._lastPrimaryCell = ;
        // }
    }

    private _inertControlSelection(selectionWithStyles: ISelectionWithStyle[]) {
        const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];

        if (
            (selectionWithStyles.length === this._previousRangesCount || this._previousRangesCount === 0) &&
            this._previousSequenceNodes != null
        ) {
            this._inertControlSelectionReplace(currentSelection);
        } else {
            // Holding down ctrl causes an addition, requiring the ref string to be increased.
            let insertNodes = this._formulaInputService.getSequenceNodes();

            if (insertNodes == null) {
                return;
            }

            const char = this._getCurrentChar();

            if (char == null) {
                return;
            }

            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;

            if (!this._matchRefDrawToken(char)) {
                this._formulaInputService.insertSequenceString(this._currentInsertRefStringIndex, matchToken.COMMA);

                insertNodes = this._formulaInputService.getSequenceNodes();

                this._previousInsertRefStringIndex += 1;
            }

            this._previousSequenceNodes = Tools.deepClone(insertNodes);

            const refString = this._getRefString(currentSelection);

            this._formulaInputService.setSequenceNodes(insertNodes);

            this._formulaInputService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

            // this._lastSequenceNodes = insertNodes;

            this._selectionRenderService.disableSkipRemainLast();
        }

        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;

        this._previousRangesCount = selectionWithStyles.length;
    }

    private _updateRefSelectionStyle(refSelections: IRefSelection[]) {
        const controls = this._selectionRenderService.getCurrentControls();

        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];

            const { refIndex, themeColor, token } = refSelection;

            const rangeWithSheet = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range } = rangeWithSheet;

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (refSheetId != null && refSheetId !== sheetId) {
                continue;
            }

            const control = controls.find((c) => {
                const { startRow, startColumn, endRow, endColumn } = c.getRange();
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    endRow === range.endRow &&
                    endColumn === range.endColumn
                ) {
                    return true;
                }
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    range.startRow === range.endRow &&
                    range.startColumn === range.endColumn
                ) {
                    return true;
                }

                return false;
            });

            if (control == null) {
                continue;
            }

            const style = getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString());

            control.updateStyle(style);
        }
    }

    private _changeControlSelection(toRange: Nullable<IRangeWithCoord>, controlSelection: SelectionShape) {
        if (!toRange) {
            return;
        }

        const { unitId, sheetId, skeleton } = this._getCurrentUnitIdAndSheetId();

        this._formulaInputService.enableLockedSelectionChange();

        const id = controlSelection.selectionStyle?.id;

        if (id == null || !Tools.isStringNumber(id)) {
            return;
        }

        let { startRow, endRow, startColumn, endColumn } = toRange;

        const primary = getCellInfoInMergeData(startRow, startColumn, skeleton?.mergeData);

        if (primary) {
            const {
                isMerged,
                isMergedMainCell,
                startRow: mergeStartRow,
                endRow: mergeEndRow,
                startColumn: mergeStartColumn,
                endColumn: mergeEndColumn,
            } = primary;

            if (
                (isMerged || isMergedMainCell) &&
                mergeStartRow === startRow &&
                mergeStartColumn === startColumn &&
                mergeEndRow === endRow &&
                mergeEndColumn === endColumn
            ) {
                startRow = mergeStartRow;
                startColumn = mergeStartColumn;
                endRow = mergeStartRow;
                endColumn = mergeStartColumn;
            }
        }

        const refString = this._getRefString({
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            primary,
            style: null,
        });

        const nodeIndex = Number(id);

        this._formulaInputService.updateSequenceRef(nodeIndex, refString);

        const sequenceNodes = this._formulaInputService.getSequenceNodes();

        const node = sequenceNodes[nodeIndex];

        if (typeof node === 'string') {
            return;
        }

        this._syncToEditor(sequenceNodes, node.endIndex + 1);

        controlSelection.update(toRange);
    }

    private _refreshFormulaAndCellEditor() {
        const unitIds = [DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

        for (const unitId of unitIds) {
            const editorObject = getEditorObject(unitId, this._renderManagerService);

            const documentComponent = editorObject?.document;

            if (documentComponent == null) {
                continue;
            }

            documentComponent.getSkeleton()?.calculate();

            documentComponent.makeDirty();
        }
    }

    private _cursorStateListener() {
        /**
         * The user's operations follow the sequence of opening the editor and then moving the cursor.
         * The logic here predicts the user's first cursor movement behavior based on this rule
         */

        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { document: documentComponent } = editorObject;
        this.disposeWithMe(
            toDisposable(
                documentComponent.onPointerDownObserver.add(() => {
                    this._arrowMoveActionState = ArrowMoveAction.moveCursor;

                    this._inputPanelState = InputPanelState.mouse;
                })
            )
        );
    }

    private _commandExecutedListener() {
        // Listen to document edits to refresh the size of the editor.
        const updateCommandList = [SelectEditorFormulaOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISelectEditorFormulaOperationParam;
                    const { keycode, metaKey } = params;

                    if (keycode === KeyCode.ENTER) {
                        if (this._formulaPromptService.isSearching()) {
                            this._formulaPromptService.accept(true);
                            return;
                        }
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction: Direction.DOWN,
                        });
                        return;
                    }
                    if (keycode === KeyCode.TAB) {
                        if (this._formulaPromptService.isSearching()) {
                            this._formulaPromptService.accept(true);
                            return;
                        }
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction: Direction.RIGHT,
                        });
                        return;
                    }

                    if (this._formulaPromptService.isSearching()) {
                        if (keycode === KeyCode.ARROW_DOWN) {
                            this._formulaPromptService.navigate({ direction: Direction.DOWN });
                            return;
                        }
                        if (keycode === KeyCode.ARROW_UP) {
                            this._formulaPromptService.navigate({ direction: Direction.UP });
                            return;
                        }
                    }

                    if (this._arrowMoveActionState === ArrowMoveAction.moveCursor) {
                        this._moveInEditor(keycode);
                        return;
                    }
                    if (this._arrowMoveActionState === ArrowMoveAction.exitInput) {
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        return;
                    }

                    if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
                        this._arrowMoveActionState = ArrowMoveAction.movingRef;
                    }

                    const previousRanges = this._selectionManagerService.getSelectionRanges() || [];

                    if (previousRanges.length === 0) {
                        const selectionData =
                            this._selectionManagerService.getLastByPlugin(NORMAL_SELECTION_PLUGIN_NAME);
                        if (selectionData != null) {
                            const selectionDataNew = Tools.deepClone(selectionData);
                            this._selectionManagerService.add([selectionDataNew]);
                        }
                    }

                    let direction = Direction.DOWN;
                    if (keycode === KeyCode.ARROW_DOWN) {
                        direction = Direction.DOWN;
                    } else if (keycode === KeyCode.ARROW_UP) {
                        direction = Direction.UP;
                    } else if (keycode === KeyCode.ARROW_LEFT) {
                        direction = Direction.LEFT;
                    } else if (keycode === KeyCode.ARROW_RIGHT) {
                        direction = Direction.RIGHT;
                    }

                    if (metaKey === MetaKeys.CTRL_COMMAND) {
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction,
                            jumpOver: JumpOver.moveGap,
                        });
                    } else if (metaKey === MetaKeys.SHIFT) {
                        this._commandService.executeCommand(ExpandSelectionCommand.id, {
                            direction,
                        });
                    } else if (metaKey === META_KEY_CTRL_AND_SHIFT) {
                        this._commandService.executeCommand(ExpandSelectionCommand.id, {
                            direction,
                            jumpOver: JumpOver.moveGap,
                        });
                    } else {
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction,
                        });
                    }

                    const selectionWithStyles = this._selectionManagerService.getSelections() || [];

                    const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];

                    this._inertControlSelectionReplace(currentSelection);
                }
            })
        );
    }

    private _moveInEditor(keycode: Nullable<KeyCode>) {
        if (keycode == null) {
            return;
        }
        let direction = Direction.LEFT;
        if (keycode === KeyCode.ARROW_DOWN) {
            direction = Direction.DOWN;
        } else if (keycode === KeyCode.ARROW_UP) {
            direction = Direction.UP;
        } else if (keycode === KeyCode.ARROW_RIGHT) {
            direction = Direction.RIGHT;
        }

        this._commandService.executeCommand(MoveCursorOperation.id, {
            direction,
        });
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }
}
