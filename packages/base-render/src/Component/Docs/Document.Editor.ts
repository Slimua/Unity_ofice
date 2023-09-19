import { DataStreamTreeTokenType, Nullable, Observable, Observer } from '@univerjs/core';

import { CURSOR_TYPE } from '../../Basics/Const';
import { IDocumentSkeletonCached } from '../../Basics/IDocumentSkeletonCached';
import { IMouseEvent, IPointerEvent } from '../../Basics/IEvents';
import { INodeInfo, INodePosition } from '../../Basics/Interfaces';
import { getOffsetRectForDom, transformBoundingCoord } from '../../Basics/Position';
import { getCurrentScrollXY } from '../../Basics/ScrollXY';
import { checkStyle, injectStyle } from '../../Basics/Tools';
import { Vector2 } from '../../Basics/Vector2';
import { ScrollTimer } from '../../ScrollTimer';
import { IScrollObserverParam, Viewport } from '../../Viewport';
import { TextSelection } from './Common/TextSelection';
import { DocComponent } from './DocComponent';

export interface IEditorInputConfig {
    event: Event | CompositionEvent | KeyboardEvent;
    content?: string;
    document: DocComponent;
    activeSelection?: TextSelection;
    selectionList?: TextSelection[];
}

export class DocsEditor {
    onKeydownObservable = new Observable<IEditorInputConfig>();

    onInputObservable = new Observable<IEditorInputConfig>();

    onCompositionstartObservable = new Observable<IEditorInputConfig>();

    onCompositionupdateObservable = new Observable<IEditorInputConfig>();

    onCompositionendObservable = new Observable<IEditorInputConfig>();

    onSelectionStartObservable = new Observable<Nullable<INodePosition>>();

    private _container: HTMLDivElement;

    private _inputParent: HTMLDivElement;

    private _input: HTMLDivElement;

    private _cursor: HTMLDivElement;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveInObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveOutObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _skeletonObserver: Nullable<Observer<IDocumentSkeletonCached>>;

    private _viewportScrollX: number;

    private _viewportScrollY: number;

    private _textSelectionList: TextSelection[] = [];

    private _activeViewport: Nullable<Viewport>;

    private _viewPortObserverMap = new Map<
        string,
        {
            scrollStop: Nullable<Observer<IScrollObserverParam>>;
            scrollBefore: Nullable<Observer<IScrollObserverParam>>;
        }
    >();

    private _isIMEInputApply = false;

    constructor(private _documents?: DocComponent) {
        this._initialDom();

        this.activeViewport = this._documents?.getFirstViewport();

        if (this._documents) {
            this.changeDocuments(this._documents);
        }
    }

    set activeViewport(viewport: Nullable<Viewport>) {
        this._attachScrollEvent(viewport);
        this._activeViewport = viewport;
    }

    static create(documents?: DocComponent) {
        return new DocsEditor(documents);
    }

    getActiveTextSelection() {
        const list = this._textSelectionList;
        for (const textSelection of list) {
            if (textSelection.isActive()) {
                return textSelection;
            }
        }
    }

    getTextSelectionList() {
        return this._textSelectionList;
    }

    add(textSelection: TextSelection) {
        this._addTextSelection(textSelection);
    }

    remain() {
        const activeSelection = this.getActiveTextSelection();
        if (activeSelection == null) {
            return;
        }
        const index = this._textSelectionList.indexOf(activeSelection);

        return this._textSelectionList.splice(index, 1)[0];
    }

    sync() {
        this._syncDomToSelection();
    }

    scroll() {
        this._scrollToSelection();
    }

    activate(toLastPosition = false): void {
        // const documents = this._documents;
        // if (!documents) {
        //     return;
        // }
        // setTimeout(() => {
        //     documents.makeDirty();
        // });
        // FIXME: I don't know if this is correct. Just trying it.
        // const lastCharIndex = documents.getSkeleton()!.getModel().bodyModel.body.dataStream.length;
        // const span = documents.findNodeByCharIndex(lastCharIndex - 1);
        // const position = documents.findPositionBySpan(span!);
        // const remain = this.remain();
        // if (position && remain) {
        //     remain.startNodePosition = { ...position, isBack: true };
        //     remain.endNodePosition = undefined;
        // }
        // if (!this._documents) {
        //    return;
        // }
        // TODO
        // this.activeViewport = this._documents.getActiveViewportByCoord(evtOffsetX, evtOffsetY);
        // const startNode = this._documents.findNodeByCoord(evtOffsetX, evtOffsetY);
        // console.log('startNode', startNode, position, evtOffsetX, evtOffsetY);
        // if (position == null) {
        //     this._deleteAllTextSelection();
        //     return;
        // }
        // if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
        //     position.isBack = true;
        // }
        // if (evt.ctrlKey || this._isEmptyTextSelection()) {
        //     const newTextSelection = new TextSelection(this._documents.getScene(), position);
        //     this._addTextSelection(newTextSelection);
        // } else {
        //     this._updateTextSelection(position);
        // }
        // this._activeSelectionRefresh();
        // this._syncDomToSelection();
    }

    active(x: number, y: number) {
        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
        this._container.style.zIndex = `1000`;

        this._cursor.style.animation = 'univer_cursor_blinkStyle 1s steps(1) infinite';
        this._cursor.style.display = 'revert';

        setTimeout(() => {
            this._input.focus();
        }, 0);
    }

    focus(): void {
        this._input.focus();
    }

    // FIXME: for editor cell editor we don't need to blur the input element
    deactivate(withoutBlur = true) {
        this._container.style.left = `0px`;
        this._container.style.top = `0px`;

        this._cursor.style.animation = '';
        this._cursor.style.display = 'none';

        if (!withoutBlur) {
            this._input.blur();
        }
    }

    changeDocuments(documents: DocComponent) {
        if (this._documents) {
            this._detachEvent(this._documents);
        }

        this._documents = documents;
        this._skeletonObserver = documents
            .getSkeleton()
            ?.onRecalculateChangeObservable.add((data: IDocumentSkeletonCached) => {
                this._deleteAllTextSelection();
            });
        this._attachSelectionEvent(this._documents);
    }

    dispose() {
        if (this._documents) {
            this._detachEvent(this._documents);
        }
        this._container.remove();
    }

    private _initialDom() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `0px`;
        container.style.top = `0px`;

        const inputParent = document.createElement('div');
        const inputDom = document.createElement('div');
        const cursorDom = document.createElement('div');

        inputParent.appendChild(inputDom);
        container.appendChild(inputParent);
        container.appendChild(cursorDom);

        this._container = container;
        this._inputParent = inputParent;
        this._input = inputDom;
        this._cursor = cursorDom;

        this._initialInput();

        this._initialCursorDom();

        this._attachInputEvent();

        document.body.appendChild(container);
    }

    private _initialInput() {
        this._inputParent.style.cssText = `
            position:absolute;
            height:1px;
            width:1px;
            overflow: hidden;
        `;

        this._input.contentEditable = 'true';

        this._input.style.cssText = `
            position: absolute;
            overflow: hidden;
            opacity: 1;
            background: #000;
            color: transparent;
            outline: none;
            z-index: -2;
            caret-color: transparent;
            white-space: pre-wrap;
            user-select: text;
        `;
    }

    private _initialCursorDom() {
        this._cursor.style.cssText = `
            visibility: visible;
            position: absolute;
            background: #000;
            left: 0;
            top: 0;
            width: 1px;
            height: 20px;
            opacity: 0;
            z-index: 0;
            pointer-events: none;
            display: none
        `;

        if (!checkStyle('keyframes univer_cursor_blinkStyle')) {
            const styles = [
                `
                @-webkit-keyframes univer_cursor_blinkStyle {
                    0% {
                        opacity: 1;
                    }

                    13% {
                        opacity: 0;
                    }

                    50% {
                        opacity: 0;
                    }

                    63% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 1;
                    }
                }
            `,
                `
                @keyframes univer_cursor_blinkStyle {
                    0% {
                        opacity: 1;
                    }

                    13% {
                        opacity: 0;
                    }

                    50% {
                        opacity: 0;
                    }

                    63% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 1;
                    }
                }
            `,
            ];
            injectStyle(styles);
        }
    }

    private _getSkeletonData() {
        return this._documents?.getSkeleton()?.getSkeletonData();
    }

    private _getNodePosition(node: Nullable<INodeInfo>) {
        if (node == null) {
            return;
        }

        const { node: span, ratioX, ratioY } = node;

        const position = this._documents?.findPositionBySpan(span);

        if (position == null) {
            return;
        }

        let isBack = false;
        //|| (span.streamType === DataStreamTreeTokenType.PARAGRAPH && isStart)
        if (ratioX < 0.5) {
            isBack = true;
        }

        return {
            ...position,
            isBack,
        };
    }

    private _interactTextSelection(activeTextSelection: TextSelection) {
        const newTextSelection: TextSelection[] = [];
        let hasIntersection = false;
        this._textSelectionList.forEach((textSelection) => {
            if (textSelection === activeTextSelection) {
                return true;
            }
            if (!activeTextSelection.isIntersection(textSelection)) {
                newTextSelection.push(textSelection);
            } else {
                hasIntersection = true;
                textSelection.dispose();
            }
        });

        if (!hasIntersection) {
            return;
        }
        newTextSelection.push(activeTextSelection);
        this._textSelectionList = newTextSelection;
    }

    private _deleteAllTextSelection() {
        this._textSelectionList.forEach((textSelection) => {
            textSelection.dispose();
        });
        this._textSelectionList = [];
    }

    private _deactivateTextSelection() {
        this._textSelectionList.forEach((textSelection) => {
            textSelection.deactivate();
        });
    }

    private _addTextSelection(textSelection: TextSelection) {
        this._deactivateTextSelection();
        textSelection.activate();
        this._textSelectionList.push(textSelection);
    }

    private _updateTextSelection(position: INodePosition) {
        if (!this._documents) {
            return;
        }
        let lastTextSelection = this._textSelectionList.pop();
        if (!lastTextSelection) {
            lastTextSelection = new TextSelection(this._documents.getScene(), position);
        }
        this._deleteAllTextSelection();
        lastTextSelection.activate();
        lastTextSelection.startNodePosition = position;
        lastTextSelection.endNodePosition = null;
        this._textSelectionList = [lastTextSelection];
    }

    private _isEmptyTextSelection() {
        return this._textSelectionList.length === 0;
    }

    private _getCanvasOffset() {
        const engine = this._documents?.getEngine();
        const canvas = engine?.getCanvasElement();

        if (!canvas) {
            return {
                left: 0,
                top: 0,
            };
        }

        const { top, left } = getOffsetRectForDom(canvas);

        return {
            left,
            top,
        };
    }

    // Let the selection show on the current screen.
    private _scrollToSelection() {
        const activeTextSelection = this.getActiveTextSelection();
        const anchor = activeTextSelection?.getAnchor();
        if (!anchor || (anchor && !anchor.visible) || this._activeViewport == null) {
            return;
        }

        const { left, top } = anchor;

        const { tl, tr, bl } = this._activeViewport.getBounding();
        const constantOffset = 100;
        let offsetY = 0;
        let offsetX = 0;
        if (top < tl.y + constantOffset) {
            offsetY = top - tl.y - constantOffset;
        } else if (top > bl.y - constantOffset) {
            offsetY = top - bl.y + constantOffset;
        }

        if (left < tl.x + constantOffset) {
            offsetX = left - tl.x - constantOffset;
        } else if (left > tr.x - constantOffset) {
            offsetX = left - tr.x + constantOffset;
        }

        const config = this._activeViewport.getBarScroll(offsetX, offsetY);
        this._activeViewport.scrollBy(config);
    }

    private _syncDomToSelection() {
        const activeTextSelection = this.getActiveTextSelection();
        const anchor = activeTextSelection?.getAnchor();
        if (!anchor || (anchor && !anchor.visible) || this._activeViewport == null) {
            return;
        }

        const { height, left, top } = anchor;

        const absoluteCoord = this._activeViewport.getAbsoluteVector(Vector2.FromArray([left, top]));

        const { x, y } = absoluteCoord;

        this._cursor.style.height = `${height}px`;

        // console.log('_syncDomToSelection', left, top, absoluteCoord?.x || 0, absoluteCoord?.y || 0);

        let { left: canvasLeft, top: canvasTop } = this._getCanvasOffset();

        canvasLeft += x;

        canvasTop += y;

        this.active(canvasLeft, canvasTop);
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        // const endX = moveOffsetX - this._viewportScrollX + scrollX;
        // const endY = moveOffsetY - this._viewportScrollY + scrollY;

        if (!this._documents) {
            return;
        }

        const endNode = this._documents.findNodeByCoord(moveOffsetX, moveOffsetY);

        const endPosition = this._getNodePosition(endNode);

        // console.log('endNode', endNode, endPosition, { moveOffsetX, moveOffsetY, _viewportScrollY: this._viewportScrollY, scrollX });

        if (!endPosition) {
            return;
        }

        const activeTextSelection = this.getActiveTextSelection();

        if (!activeTextSelection) {
            return;
        }

        activeTextSelection.endNodePosition = endPosition;

        activeTextSelection.refresh(this._documents);

        this._interactTextSelection(activeTextSelection);
    }

    private _attachScrollEvent(viewport: Nullable<Viewport>) {
        if (!viewport) {
            return;
        }
        const key = viewport.viewPortKey;
        if (this._viewPortObserverMap.has(key)) {
            return;
        }

        const scrollBefore = viewport.onScrollBeforeObserver.add((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const textSelection = this.getActiveTextSelection();

            textSelection?.activeStatic();

            this._cursor.style.display = 'none';
        });

        const scrollStop = viewport.onScrollStopObserver.add((param: IScrollObserverParam) => {
            const viewport = param.viewport;
            if (!viewport) {
                return;
            }

            const bounds = viewport.getBounding();

            const textSelection = this.getActiveTextSelection();

            const anchor = textSelection?.getAnchor();

            if (!anchor || (anchor && !anchor.visible)) {
                return;
            }

            if (bounds) {
                const { minX, maxX, minY, maxY } = transformBoundingCoord(anchor, bounds);

                if (anchor.strokeWidth < minX || maxX < 0 || anchor.strokeWidth < minY || maxY < 0) {
                    return;
                }
            }

            this._syncDomToSelection();

            textSelection?.deactivateStatic();

            this._cursor.style.display = 'revert';
        });

        this._viewPortObserverMap.set(key, {
            scrollBefore,
            scrollStop,
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _attachInputEvent() {
        // NOTE@wzhudev: keydown is probably unnecessary
        this._input.addEventListener('keydown', (e) => {
            if (this._isIMEInputApply) {
                return;
            }
            const activeSelection = this.getActiveTextSelection();
            const selectionList = this.getTextSelectionList();
            if (this._documents == null) {
                return;
            }
            this._input.innerHTML = '';
            this.onKeydownObservable.notifyObservers({
                event: e,
                content: '',
                document: this._documents,
                activeSelection,
                selectionList,
            });
        });

        this._input.addEventListener('input', (e) => {
            if (this._isIMEInputApply) {
                return;
            }

            const content = this._input.textContent || '';

            this._input.innerHTML = '';

            const activeSelection = this.getActiveTextSelection();
            const selectionList = this.getTextSelectionList();

            if (this._documents == null) {
                return;
            }
            this.onInputObservable.notifyObservers({
                event: e,
                content,
                document: this._documents,
                activeSelection,
                selectionList,
            });
        });

        this._input.addEventListener('compositionstart', (e) => {
            this._isIMEInputApply = true;

            const content = this._input.textContent || '';

            this._input.innerHTML = '';

            const activeSelection = this.getActiveTextSelection();
            const selectionList = this.getTextSelectionList();

            if (this._documents == null) {
                return;
            }

            this.onCompositionstartObservable.notifyObservers({
                event: e,
                content,
                document: this._documents,
                activeSelection,
                selectionList,
            });
        });

        this._input.addEventListener('compositionend', (e) => {
            this._isIMEInputApply = false;
            const content = this._input.textContent || '';

            this._input.innerHTML = '';

            const activeSelection = this.getActiveTextSelection();
            const selectionList = this.getTextSelectionList();

            if (this._documents == null) {
                return;
            }

            this.onCompositionendObservable.notifyObservers({
                event: e,
                content,
                document: this._documents,
                activeSelection,
                selectionList,
            });
        });

        this._input.addEventListener('compositionupdate', (e) => {
            const content = this._input.textContent || '';

            this._input.innerHTML = '';

            const activeSelection = this.getActiveTextSelection();
            const selectionList = this.getTextSelectionList();

            if (this._documents == null) {
                return;
            }

            this.onCompositionupdateObservable.notifyObservers({
                event: e,
                content,
                document: this._documents,
                activeSelection,
                selectionList,
            });
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _attachSelectionEvent(documents: DocComponent) {
        this._moveInObserver = documents.onPointerEnterObserver.add(() => {
            documents.cursor = CURSOR_TYPE.TEXT;
        });

        this._moveOutObserver = documents.onPointerLeaveObserver.add(() => {
            documents.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        });
        const scene = documents.getScene();

        this._downObserver = documents.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this._documents) {
                return;
            }

            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this.activeViewport = this._documents.getActiveViewportByCoord(evtOffsetX, evtOffsetY);

            const startNode = this._documents.findNodeByCoord(evtOffsetX, evtOffsetY);

            const position = this._getNodePosition(startNode);

            console.log('startNode', startNode, position, evtOffsetX, evtOffsetY);

            if (position == null) {
                this._deleteAllTextSelection();
                return;
            }

            if (startNode?.node.streamType === DataStreamTreeTokenType.PARAGRAPH) {
                position.isBack = true;
            }

            if (evt.ctrlKey || this._isEmptyTextSelection()) {
                const newTextSelection = new TextSelection(this._documents.getScene(), position);
                this._addTextSelection(newTextSelection);
            } else {
                this._updateTextSelection(position);
            }

            this._activeSelectionRefresh();

            this._syncDomToSelection();

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(scene);
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            this.onSelectionStartObservable.notifyObservers(this.getActiveTextSelection()?.getStart());

            let preMoveOffsetX = evtOffsetX;

            let preMoveOffsetY = evtOffsetY;

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                scene.setCursor(CURSOR_TYPE.TEXT);
                if (Math.sqrt((moveOffsetX - preMoveOffsetX) ** 2 + (moveOffsetY - preMoveOffsetY) ** 2) < 3) {
                    return;
                }
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                });
                preMoveOffsetX = moveOffsetX;
                preMoveOffsetY = moveOffsetY;
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();

                scrollTimer.dispose();
            });

            // state.stopPropagation();
        });
    }

    private _detachEvent(documents: DocComponent) {
        documents.onPointerEnterObserver.remove(this._moveInObserver);
        documents.onPointerLeaveObserver.remove(this._moveOutObserver);
        documents.onPointerDownObserver.remove(this._downObserver);
        documents.getSkeleton()?.onRecalculateChangeObservable.remove(this._skeletonObserver);
        this.onKeydownObservable.clear();
        this.onInputObservable.clear();
        this.onCompositionstartObservable.clear();
        this.onCompositionupdateObservable.clear();
        this.onCompositionendObservable.clear();
        this.onSelectionStartObservable.clear();
    }

    private _activeSelectionRefresh() {
        if (!this._documents) {
            return;
        }
        const activeSelection = this.getActiveTextSelection();

        activeSelection?.refresh(this._documents);
    }
}
