import { Documents, IDocumentSkeletonSpan, SpanType, TextSelection } from '@univerjs/base-render';
import { KeyboardKeyType, Nullable } from '@univerjs/core';

export class InputController {
    private _previousIMEContent: string = '';

    private _previousIMEStart: number;

    constructor() {
        this._initialize();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialize() {
        const events = this._plugin.getInputEvent();
        if (!events) {
            return;
        }
        const { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onKeydownObservable } = events;

        onKeydownObservable.add((config) => {
            const { event, document, activeSelection, selectionList } = config;
            const e = event as KeyboardEvent;

            const activeRange = activeSelection?.getRange();

            const segmentId = activeSelection?.segmentId;

            const skeleton = document.getSkeleton();

            if (!skeleton || !activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            if (e.key === KeyboardKeyType.backspace) {
                let cursor = cursorStart;

                if (isStartBack === true) {
                    cursor -= 1;
                }

                if (isCollapse === false) {
                    cursor += 1;
                }

                const selectionRemain = document.remainActiveSelection();

                // const content = document.findNodeByCharIndex(cursor - 1)?.content || '';

                docsModel.deleteText(activeRange, segmentId);

                skeleton.calculate();

                const span = document.findNodeByCharIndex(cursor - 1);

                this._adjustSelection(document, selectionRemain, span);

                this._resetIME();
            }
        });

        onInputObservable.add((config) => {
            const { event, content = '', document, activeSelection, selectionList } = config;

            const activeRange = activeSelection?.getRange();

            const skeleton = document.getSkeleton();

            const segmentId = activeSelection?.segmentId;

            if (!skeleton || !activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            if (isCollapse) {
                let cursor = cursorStart;

                if (isStartBack === false) {
                    cursor += 1;
                }

                const selectionRemain = document.remainActiveSelection();

                docsModel.insertText(content, activeRange, segmentId);

                skeleton.calculate();

                const span = document.findNodeByCharIndex(cursor + content.length - 1);

                this._adjustSelection(document, selectionRemain, span);
            }
        });

        onCompositionstartObservable.add((config) => {
            const { activeSelection, selectionList } = config;

            const activeRange = activeSelection?.getRange();

            if (!activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            let cursor = cursorStart;

            if (isStartBack === false) {
                cursor += 1;
            }
            this._previousIMEStart = cursor;

            // console.log('_previousIMEStart', this._previousIMEStart);
        });

        onCompositionupdateObservable.add((config) => {
            const { event, document } = config;

            let cursor = this._previousIMEStart - 1;

            const skeleton = document.getSkeleton();

            if (!skeleton) {
                return;
            }

            const e = event as CompositionEvent;

            const content = e.data;

            if (content === this._previousIMEContent) {
                return;
            }

            const selectionRemain = document.remainActiveSelection();

            // const increaseText = this._getIncreaseText(content, this._previousIMEContent);

            // docsModel.insertText(increaseText, cursor);

            docsModel.updateText(content, this._previousIMEContent, cursor);

            skeleton.calculate();

            const span = document.findNodeByCharIndex(cursor + content.length);

            this._adjustSelection(document, selectionRemain, span);

            console.log(
                'Compositionupdate',
                content,
                this._previousIMEContent,
                e.data,
                this._previousIMEStart,
                cursor,
                selectionRemain,
                span,
                skeleton.getSkeletonData(),
                skeleton
            );

            this._previousIMEContent = content;
        });

        onCompositionendObservable.add((config) => {
            this._resetIME();
        });
    }

    private _resetIME() {
        this._previousIMEContent = '';

        this._previousIMEStart = -1;
    }

    private _getIncreaseText(current: string, old: string) {
        const oldLen = old.length;
        return current.slice(oldLen);
    }

    private _adjustSelection(document: Documents, selectionRemain?: TextSelection, span?: Nullable<IDocumentSkeletonSpan>) {
        if (span == null) {
            return;
        }

        const position = document.findPositionBySpan(span);

        if (position == null || selectionRemain == null) {
            return;
        }

        if (this._hasListSpan(span)) {
            position.span += 1;
        }

        const newPos = { ...position, isBack: false };

        document.addSelection(selectionRemain);

        selectionRemain.startNodePosition = newPos;

        selectionRemain.endNodePosition = undefined;

        selectionRemain.refresh(document);

        document.syncSelection();
    }

    private _hasListSpan(span: Nullable<IDocumentSkeletonSpan>) {
        const divide = span?.parent;

        if (divide == null) {
            return false;
        }

        const spanGroup = divide.spanGroup;

        return spanGroup[0]?.spanType === SpanType.LIST;
    }
}