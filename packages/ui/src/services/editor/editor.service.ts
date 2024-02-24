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

import type { DocumentDataModel, IDocumentData, IDocumentStyle, IPosition, Nullable } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, Disposable, EDITOR_ACTIVATED, FOCUSING_DOC, FOCUSING_EDITOR_BUT_HIDDEN, FOCUSING_EDITOR_INPUT_FORMULA, FOCUSING_FORMULA_EDITOR, FOCUSING_SHEET, HorizontalAlign, IContextService, IUniverInstanceService, Tools, VerticalAlign } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import type { IRender, Scene } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';

export interface IEditorStateParam extends Partial<IPosition> {
    visible?: boolean;
}

export interface IEditorCanvasStyle {
    fontSize?: number;
}

export interface IEditorConfigParam {
    editorUnitId: string;

    initialSnapshot?: IDocumentData;
    cancelDefaultResizeListener?: boolean;
    canvasStyle?: IEditorCanvasStyle;
    isSingle?: boolean;
    isSheetEditor: boolean;
}

export interface IEditorSetParam extends IEditorConfigParam, IEditorStateParam {
    render: IRender;
    documentDataModel: DocumentDataModel;
    editorDom: HTMLDivElement;
}

export interface IEditorService {
    getEditor(id?: string): Readonly<Nullable<IEditorSetParam>>;

    setState(param: IEditorStateParam, id: string): void;

    register(config: IEditorConfigParam, container: HTMLDivElement): void;

    unRegister(editorUnitId: string): void;

    isVisible(id: string): Nullable<boolean>;

    inputFormula$: Observable<string>;

    inputFormula(formulaString: string): void;

    resize$: Observable<string>;

    resize(id: string): void;

    getAllEditor(): Map<string, IEditorSetParam>;

    setOperationSheetUnitId(unitId: Nullable<string>): void;

    getOperationSheetUnitId(): Nullable<string>;

    setOperationSheetSubUnitId(sheetId: Nullable<string>): void;

    getOperationSheetSubUnitId(): Nullable<string>;

    isEditor(editorUnitId: string): boolean;

    isSheetEditor(editorUnitId: string): boolean;

    blur$: Observable<unknown>;

    blur(): void;
}

export class EditorService extends Disposable implements IEditorService, IDisposable {
    private _editors = new Map<string, IEditorSetParam>();

    private readonly _state$ = new Subject<Nullable<IEditorStateParam>>();

    readonly state$ = this._state$.asObservable();

    private _currentSheetUnitId: Nullable<string>;

    private _currentSheetSubUnitId: Nullable<string>;

    private readonly _inputFormula$ = new Subject<string>();

    readonly inputFormula$ = this._inputFormula$.asObservable();

    private readonly _resize$ = new Subject<string>();

    readonly resize$ = this._resize$.asObservable();

    private readonly _blur$ = new Subject<unknown>();

    readonly blur$ = this._blur$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    isSheetEditor(editorUnitId: string) {
        const editor = this._editors.get(editorUnitId);
        return !!(editor && editor.isSheetEditor);
    }

    blur() {
        const documentDataModel = this._currentUniverService.getCurrentUniverDocInstance();
        const editorUnitId = documentDataModel.getUnitId();
        if (!this.isEditor(editorUnitId) || this.isSheetEditor(editorUnitId)) {
            return;
        }
        // const editor = this._editors.get(editorUnitId);
        this._blur$.next(null);
    }

    inputFormula(formulaString: string) {
        this._inputFormula$.next(formulaString);
    }

    dispose(): void {
        this._state$.complete();
        this._editors.clear();
    }

    getEditor(id: string): Readonly<Nullable<IEditorSetParam>> {
        return this._editors.get(id);
    }

    getAllEditor() {
        return this._editors;
    }

    resize(unitId: string) {
        const editor = this.getEditor(unitId);
        if (editor == null) {
            return;
        }

        this._verticalAlign(unitId);

        this._resize$.next(unitId);
    }

    setState(param: IEditorStateParam, id: string) {
        const editor = this._editors.get(id);
        if (editor) {
            this._editors.set(id, {
                ...editor,
                ...param,
            });
        }

        this._refresh(param);
    }

    isVisible(id: string) {
        return this.getEditor(id)?.visible;
    }

    setOperationSheetUnitId(unitId: Nullable<string>) {
        this._currentSheetUnitId = unitId;
    }

    getOperationSheetUnitId() {
        return this._currentSheetUnitId;
    }

    setOperationSheetSubUnitId(sheetId: Nullable<string>) {
        this._currentSheetSubUnitId = sheetId;
    }

    getOperationSheetSubUnitId() {
        return this._currentSheetSubUnitId;
    }

    register(config: IEditorConfigParam, container: HTMLDivElement) {
        const { initialSnapshot, editorUnitId, isSheetEditor, canvasStyle = {}, isSingle = true } = config;

        const documentDataModel = this._currentUniverService.createDoc(initialSnapshot || this._getBlank(editorUnitId));

        const render = this._renderManagerService.getRenderById(editorUnitId);

        if (render == null) {
            throw new Error('An error occurred while creating the editor render.');
        }

        render.engine.setContainer(container);

        this._editors.set(editorUnitId, { ...config, isSheetEditor, render, documentDataModel, editorDom: container, canvasStyle, isSingle });

        // Delete scroll bar
        (render.mainComponent?.getScene() as Scene)?.getViewports()?.[0].getScrollBar()?.dispose();

        // this._updateCanvasStyle(editorUnitId);

        this._verticalAlign(editorUnitId);
    }

    unRegister(editorUnitId: string) {
        this._editors.delete(editorUnitId);

        this._currentUniverService.disposeDocument(editorUnitId);
    }

    private _refresh(param: IEditorStateParam): void {
        this._state$.next(param);
    }

    private _getBlank(id: string) {
        return {
            id,
            body: {
                dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
                textRuns: [],
                paragraphs: [
                    {
                        startIndex: 0,
                    },
                ],
            },
            documentStyle: {
                renderConfig: {
                    verticalAlign: VerticalAlign.TOP,
                    horizontalAlign: HorizontalAlign.LEFT,
                },
                marginLeft: 2,
                marginTop: 2,
            },
        } as IDocumentData;
    }

    private _verticalAlign(id: string) {
        if (this.isSheetEditor(id)) {
            return;
        }

        const editor = this.getEditor(id);
        const documentDataModel = editor?.documentDataModel;
    }

    private _updateCanvasStyle(id: string) {
        if (this.isSheetEditor(id)) {
            return;
        }

        const editor = this.getEditor(id);
        const documentDataModel = editor?.documentDataModel;
        if (documentDataModel == null) {
            return;
        }

        const documentStyle: IDocumentStyle = {};

        if (editor?.canvasStyle?.fontSize) {
            if (documentStyle.textStyle == null) {
                documentStyle.textStyle = {};
            }

            documentStyle.textStyle.fs = editor.canvasStyle.fontSize;
        }

        documentDataModel.updateDocumentStyle(documentStyle);
    }
}

export const IEditorService = createIdentifier<IEditorService>(
    'univer.editor.service'
);
