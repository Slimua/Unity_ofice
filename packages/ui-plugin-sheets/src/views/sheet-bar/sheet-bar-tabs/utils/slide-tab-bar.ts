import { Animate } from './animate';

export interface IScrollState {
    leftEnd: boolean;
    rightEnd: boolean;
}
export interface SlideTabBarConfig {
    slideTabBarClassName: string;
    slideTabBarItemActiveClassName: string;
    slideTabBarItemClassName: string;
    slideTabBarSpanEditClassName: string;
    slideTabRootClassName: string;
    slideTabBarItemAutoSort: boolean;
    currentIndex: number;
    onSlideEnd: (event: MouseEvent, compareIndex: number) => void;
    onChangeName: (id: string, name: string) => void;
    onChangeTab: (event: FocusEvent, id: string) => void;
    onScroll: (state: IScrollState) => void;
    onEmptyAlert: (message: string) => void;
}

export interface SlideTabItemAnimate {
    translateX: (x: number) => void;
    cancel: () => void;
}

export class SlideTabItem {
    _slideTabItem: HTMLElement;

    _animate: Animate | null;

    _midline: number = 0;

    _translateX: number;

    _scrollbar: SlideScrollbar;

    _slideTabBar: SlideTabBar;

    _editMode: boolean;

    _placeholder: HTMLElement | null;

    constructor(slideTabItem: HTMLElement, slideTabBar: SlideTabBar) {
        this._slideTabItem = slideTabItem;
        this._animate = null;
        this._translateX = 0;
        this._editMode = false;
        this._slideTabBar = slideTabBar;
        this._placeholder = null;
        this._scrollbar = slideTabBar.getScrollbar();
        this.update();
    }

    static midline(item: SlideTabItem) {
        return item.getBoundingRect().x + item.getBoundingRect().width / 2;
    }

    static leftLine(item: SlideTabItem) {
        return item.getBoundingRect().x;
    }

    static rightLine(item: SlideTabItem) {
        return item.getBoundingRect().x + item.getBoundingRect().width;
    }

    static make(nodeList: NodeList, slideTabBar: SlideTabBar): SlideTabItem[] {
        const result: SlideTabItem[] = [];
        nodeList.forEach((item) => result.push(new SlideTabItem(item as HTMLElement, slideTabBar)));
        return result;
    }

    getSlideTabItem(): HTMLElement {
        return this._slideTabItem;
    }

    isEditMode(): boolean {
        return this._editMode;
    }

    classList(): DOMTokenList {
        return this._slideTabItem.classList;
    }

    primeval(): HTMLElement {
        return this._slideTabItem;
    }

    translateX(x: number) {
        this._translateX = x;
        this._slideTabItem.style.transform = `translateX(${x}px)`;
        return this.getTranslateXDirection();
    }

    editor(callback?: (event: FocusEvent) => void): void {
        let compositionFlag = true;
        if (this._editMode === false) {
            const input = this.primeval().querySelector('span');

            const blurAction = (focusEvent: FocusEvent) => {
                if (this.emptyCheck()) return;

                this._editMode = false;

                if (input) {
                    input.removeAttribute('contentEditable');
                    input.removeEventListener('blur', blurAction);
                    input.removeEventListener('compositionstart', compositionstartAction);
                    input.removeEventListener('compositionend', compositionendAction);
                    input.removeEventListener('input', inputAction);
                    input.removeEventListener('keydown', keydownAction);
                    input.classList.remove(this._slideTabBar.getConfig().slideTabBarSpanEditClassName);
                }

                // Event must be removed before updateItems
                this._slideTabBar.removeListener();
                this._slideTabBar.updateItems();
                if (this._slideTabBar.getConfig().onChangeName) {
                    const text = input?.innerText || '';
                    const id = this.getId();
                    this._slideTabBar.getConfig().onChangeName(id, text);
                }

                if (callback) {
                    callback(focusEvent);
                }
            };

            let keydownAction = (e: KeyboardEvent) => {
                if (!input) return;
                e.stopPropagation();

                if (e.key === 'Enter') {
                    input.blur();
                }
            };

            const compositionstartAction = (e: CompositionEvent) => {
                compositionFlag = false;
            };

            const compositionendAction = (e: CompositionEvent) => {
                compositionFlag = true;
            };

            const inputAction = (e: Event) => {
                if (!input) return;
                const maxLength = 50;

                setTimeout(() => {
                    if (compositionFlag) {
                        const text = input.innerText;
                        if (text.length > maxLength) {
                            input.innerText = text.substring(0, maxLength);
                            SlideTabBar.keepLastIndex(input);
                        }
                    }
                }, 0);
            };

            if (input) {
                input.setAttribute('contentEditable', 'true');
                input.addEventListener('blur', blurAction);
                input.addEventListener('compositionstart', compositionstartAction);
                input.addEventListener('compositionend', compositionendAction);
                input.addEventListener('input', inputAction);
                input.addEventListener('keydown', keydownAction);
                input.classList.add(this._slideTabBar.getConfig().slideTabBarSpanEditClassName);
                this._editMode = true;
                SlideTabBar.keepSelectAll(input);
            }
        }
    }

    emptyCheck() {
        const input = this.primeval().querySelector('span');
        if (!input) return false;
        const text = input.innerText;
        if (text.trim() === '') {
            this._slideTabBar.getConfig().onEmptyAlert('The sheet name cannot be empty.');
            return true;
        }
        return false;
    }

    animate(): SlideTabItemAnimate {
        return {
            translateX: (x: number) => {
                if (this._translateX !== x) {
                    if (this._animate) {
                        this._animate.cancel();
                        this._animate = null;
                    }
                    this._animate = new Animate({
                        begin: this._translateX,
                        end: x,
                        receive: (val: number) => {
                            this._slideTabItem.style.transform = `translateX(${val}px)`;
                        },
                    });
                    this._translateX = x;
                    this._animate.request();
                }
            },
            cancel: () => {
                if (this._animate) {
                    this._animate.cancel();
                    this._animate = null;
                }
            },
        };
    }

    after(other: SlideTabItem) {
        this._slideTabItem.after(other._slideTabItem || other);
    }

    update() {
        this._midline = SlideTabItem.midline(this);
    }

    disableFixed() {
        if (this._placeholder) {
            const primeval = this._slideTabBar.primeval();

            this._slideTabItem.style.removeProperty('position');
            this._slideTabItem.style.removeProperty('left');
            this._slideTabItem.style.removeProperty('top');
            this._slideTabItem.style.removeProperty('width');
            this._slideTabItem.style.removeProperty('height');
            this._slideTabItem.style.removeProperty('box-shadow');
            this._slideTabItem.style.removeProperty('background');
            this._slideTabItem.style.removeProperty('padding');
            this._slideTabItem.style.removeProperty('boxSizing');
            this._slideTabItem.style.removeProperty('fontSize');
            this._slideTabItem.style.removeProperty('color');
            this._slideTabItem.style.removeProperty('borderRadius');

            this._placeholder.after(this._slideTabItem);
            primeval.removeChild(this._placeholder);
            this._placeholder = null;
        }
    }

    enableFixed() {
        const placeholder = document.createElement('div');
        const boundingRect = this.getBoundingRect();
        const computedStyles = getComputedStyle(this._slideTabItem);
        const innerSpan = this._slideTabItem.querySelector('span');

        this._placeholder = placeholder;
        this._placeholder.style.width = `${boundingRect.width}px`;
        this._placeholder.style.height = `${boundingRect.height}px`;
        this._placeholder.style.flexShrink = '0';
        this._placeholder.style.margin = computedStyles.margin;

        this._slideTabItem.style.background = computedStyles.background;
        if (innerSpan) {
            const innerPadding = getComputedStyle(innerSpan).padding;
            this._slideTabItem.style.padding = innerPadding;
        }
        this._slideTabItem.style.boxSizing = computedStyles.boxSizing;
        this._slideTabItem.style.fontSize = computedStyles.fontSize;
        this._slideTabItem.style.color = computedStyles.color;
        this._slideTabItem.style.borderRadius = computedStyles.borderRadius;

        this._slideTabItem.style.left = `${boundingRect.x - this.getScrollbar().getScrollX()}px`;
        this._slideTabItem.style.top = `${boundingRect.y}px`;
        this._slideTabItem.style.width = `${boundingRect.width}px`;
        this._slideTabItem.style.height = `${boundingRect.height}px`;
        this._slideTabItem.style.boxShadow = '0px 0px 1px 1px rgba(82,82,82,0.1)';
        this._slideTabItem.style.position = 'fixed';

        this._slideTabItem.after(placeholder);
        document.body.appendChild(this._slideTabItem);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        this._slideTabItem.addEventListener(type, action, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        this._slideTabItem.removeEventListener(type, action, options);
    }

    getScrollbar() {
        return this._scrollbar;
    }

    getMidLine() {
        return this._midline;
    }

    getBoundingRect() {
        const boundingClientRect = this._slideTabItem.getBoundingClientRect();
        boundingClientRect.x += this._scrollbar.getScrollX();
        return boundingClientRect;
    }

    getWidth() {
        return this.getBoundingRect().width;
    }

    getTranslateXDirection() {
        const midline = SlideTabItem.midline(this);
        return midline > this._midline ? 1 : midline < this._midline ? -1 : 0;
    }

    equals(other: SlideTabItem | null) {
        return other && other._slideTabItem === this._slideTabItem;
    }

    getId(): string {
        return this._slideTabItem.dataset.id || '';
    }
}

export class SlideScrollbar {
    protected _slideTabBar: SlideTabBar;

    protected _scrollX: number;

    constructor(slideTabBar: SlideTabBar) {
        const primeval = slideTabBar.primeval();
        this._scrollX = primeval.scrollLeft;
        this._slideTabBar = slideTabBar;
    }

    scrollX(x: number) {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = x;
        this._scrollX = primeval.scrollLeft;
    }

    scrollRight() {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = primeval.scrollWidth;
        this._scrollX = primeval.scrollLeft;
    }

    getScrollX(): number {
        return this._scrollX;
    }
}

export class SlideTabBar {
    /** Time in milliseconds to wait to raise long press events if button is still pressed */
    static LongPressDelay = 500; // in milliseconds

    /** Time in milliseconds with two consecutive clicks will be considered as a double click */
    static DoubleClickDelay = 300; // in milliseconds

    protected _activeTabItemIndex: number = 0;

    protected _slideTabBar: HTMLElement;

    protected _slideTabItems: SlideTabItem[] = [];

    protected _config: SlideTabBarConfig;

    protected _downActionX: number = 0;

    protected _moveActionX: number = 0;

    protected _compareIndex: number = 0;

    protected _activeTabItem: SlideTabItem | null = null;

    protected _moveAction: (e: MouseEvent) => void;

    protected _upAction: (e: MouseEvent) => void;

    protected _downAction: (e: MouseEvent) => void;

    protected _wheelAction: (e: WheelEvent) => void;

    protected _scrollIncremental: number = 0;

    protected _compareDirection: number = 0;

    protected _autoScrollTime: number | null = null;

    protected _slideScrollbar: SlideScrollbar;

    protected _longPressTimer: number | null = null;

    /**
     * left border line
     */
    protected _leftBoundingLine: number = 0;

    /**
     * right border line
     */
    protected _rightBoundingLine: number = 0;

    /**
     * The distance required to move to the left border
     */
    protected _leftMoveX: number = 0;

    /**
     * The distance required to move to the right border
     */
    protected _rightMoveX: number = 0;

    constructor(config: Partial<SlideTabBarConfig>) {
        if (config.slideTabRootClassName == null) {
            throw new Error('not found slide-tab-bar root element');
        }

        const slideTabBar = document.querySelector(
            `.${config.slideTabRootClassName} .${config.slideTabBarClassName ?? 'slide-tab-bar'}`
        );
        if (slideTabBar == null) {
            throw new Error('not found slide-tab-bar');
        }

        this._slideTabBar = slideTabBar as HTMLElement;
        this._slideScrollbar = new SlideScrollbar(this);
        this._config = config as SlideTabBarConfig;

        this._initConfig();

        let lastPageX = 0;
        let lastPageY = 0;
        let lastTime = 0;
        this._downAction = (downEvent: MouseEvent) => {
            const slideItemId = (downEvent.target as HTMLElement)
                ?.closest(`.${config.slideTabBarItemClassName}`)
                ?.getAttribute('data-id');
            const slideItemIndex = this._slideTabItems.findIndex((item) => item.getId() === slideItemId);

            if (slideItemId == null || slideItemIndex === -1) return;

            // switch tab
            if (this._activeTabItemIndex !== slideItemIndex) {
                this._activeTabItem?.removeEventListener('pointermove', this._moveAction);
                this._activeTabItem?.removeEventListener('pointerup', this._upAction);
                this.removeListener();
                this._config.onChangeTab(downEvent, slideItemId);
                return;
            }

            this._compareIndex = slideItemIndex;
            this._downActionX = downEvent.pageX;
            this._moveActionX = 0;
            this._scrollIncremental = 0;
            this._activeTabItem = this._slideTabItems[slideItemIndex];
            if (!this._activeTabItem) {
                console.error('Not found active slide-tab-item in sheet bar');
                return;
            }

            const activeSlideItemElement = this._activeTabItem.getSlideTabItem();
            activeSlideItemElement?.setPointerCapture((downEvent as PointerEvent).pointerId);
            this._activeTabItem?.addEventListener('pointerup', this._upAction);

            const { x, width } = this._activeTabItem.getBoundingRect();
            const { x: containerX, width: containerWidth } = this.getBoundingRect();
            const scrollX = this._slideScrollbar.getScrollX();
            this._leftBoundingLine = this._downActionX - (x - scrollX);
            this._rightBoundingLine = x - scrollX + width - this._downActionX;
            this._leftMoveX = x - containerX - scrollX;
            this._rightMoveX = containerX + containerWidth - (x + width) + scrollX;

            if (downEvent.button === 2 || this._hasEditItem()) {
                return;
            }

            const { pageX, pageY } = downEvent;
            const current = Date.now();
            const diffTime = current - lastTime <= SlideTabBar.DoubleClickDelay;
            const diffPageX = Math.abs(pageX - lastPageX) < 10;
            const diffPageY = Math.abs(pageY - lastPageY) < 10;

            // double click
            if (diffTime && diffPageX && diffPageY) {
                // user editor
                this._activeTabItem.editor();
            }

            lastPageX = pageX;
            lastPageY = pageY;
            lastTime = current;

            // Set a timer to delay dragging for 300 milliseconds
            this._longPressTimer = window.setTimeout(() => {
                this._activeTabItem?.enableFixed();
                this._startAutoScroll();
                if (!activeSlideItemElement) return;
                // Set the mouse cursor to drag
                activeSlideItemElement.setPointerCapture((downEvent as PointerEvent).pointerId);
                activeSlideItemElement.style.cursor = 'move';
                this._activeTabItem?.addEventListener('pointermove', this._moveAction);
            }, SlideTabBar.LongPressDelay);
        };

        this._upAction = (upEvent: MouseEvent) => {
            // Clear timer
            if (this._longPressTimer) {
                clearTimeout(this._longPressTimer);
                this._longPressTimer = null;
            }

            if (!this._activeTabItem) return;

            this._closeAutoScroll();
            this._activeTabItem.disableFixed();
            // this._sortedItems();
            this.updateItems();

            // Restore the mouse cursor
            const activeSlideItemElement = this._activeTabItem?.getSlideTabItem();
            if (!activeSlideItemElement) return;

            activeSlideItemElement.style.cursor = '';
            activeSlideItemElement.releasePointerCapture((upEvent as PointerEvent).pointerId);

            this._activeTabItem?.removeEventListener('pointermove', this._moveAction);
            this._activeTabItem?.removeEventListener('pointerup', this._upAction);
            if (this._config.onSlideEnd && this._activeTabItemIndex !== this._compareIndex) {
                this.removeListener();
                this._config.onSlideEnd(upEvent, this._compareIndex || 0);
            }

            this._scrollIncremental = 0;
            this._downActionX = 0;
            this._moveActionX = 0;
            this._compareIndex = 0;
        };

        this._moveAction = (moveEvent) => {
            if (this._activeTabItem) {
                this._moveActionX = moveEvent.pageX - this._downActionX;
                if (this._moveActionX <= -this._leftMoveX) {
                    this._moveActionX = -this._leftMoveX;
                } else if (this._moveActionX >= this._rightMoveX) {
                    this._moveActionX = this._rightMoveX;
                }
                this._scrollIncremental = 0;
                this._scrollLeft(moveEvent);
                this._scrollRight(moveEvent);
            }
        };

        this._wheelAction = (wheelEvent: WheelEvent) => {
            this.setScroll(wheelEvent.deltaY);
        };

        this.addListener();
    }

    static checkedSkipSlide(event: MouseEvent): boolean {
        let parent: HTMLElement | null = event.target as HTMLElement;
        while (parent != null && parent !== document.body) {
            if (parent.getAttribute('data-slide-skip')) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    static keepLastIndex(inputHtml: HTMLElement) {
        setTimeout(() => {
            const range = window.getSelection();
            if (range) {
                range.selectAllChildren(inputHtml);
                range.collapseToEnd();
            }
        });
    }

    static keepSelectAll(inputHtml: HTMLElement) {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection) return;

            const range = document.createRange();
            range.selectNodeContents(inputHtml);

            selection.removeAllRanges();
            selection.addRange(range);
        });
    }

    /**
     * The current instance is persistent, but some parameters need to be updated after refreshing
     * @param currentIndex
     */
    update(currentIndex: number) {
        this._config.currentIndex = currentIndex;
        this._initConfig();
        this.removeListener();
        this.addListener();
    }

    primeval(): HTMLElement {
        return this._slideTabBar;
    }

    updateItems(): void {
        for (let i = 0; i < this._slideTabItems.length; i++) {
            this._slideTabItems[i].animate().cancel();
            this._slideTabItems[i].translateX(0);
            this._slideTabItems[i].update();
        }
    }

    getScrollbar(): SlideScrollbar {
        return this._slideScrollbar;
    }

    getConfig(): SlideTabBarConfig {
        return this._config;
    }

    getBoundingRect(): DOMRect {
        return this._slideTabBar.getBoundingClientRect();
    }

    getSlideTabItems(): SlideTabItem[] {
        return this._slideTabItems;
    }

    getActiveItem() {
        return this._activeTabItem;
    }

    isLeftEnd(): boolean {
        return this._slideTabBar.scrollLeft === 0;
    }

    isRightEnd(): boolean {
        const parent = this._slideTabBar.parentElement;
        if (!parent) return false;
        return this._slideTabBar.scrollWidth - parent.clientWidth === this._slideTabBar.scrollLeft;
    }

    addListener() {
        this._slideTabBar.addEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.addEventListener('pointerdown', this._downAction);
        });
    }

    removeListener(): void {
        this._slideTabBar.removeEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.removeEventListener('pointerdown', this._downAction);
        });
    }

    setScroll(x: number) {
        this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + x);

        this._config.onScroll({
            leftEnd: this.isLeftEnd(),
            rightEnd: this.isRightEnd(),
        });
    }

    destroy() {
        this._downActionX = 0;
        this._moveActionX = 0;
        this._compareDirection = 0;
        this._compareIndex = 0;
        this._slideTabItems = [];
        this._activeTabItem = null;
        this.removeListener();

        // TODO@Dushusir: If set to null, the types in other places need to be judged
        // this._slideTabBar = null;
        // this._slideScrollbar = null;
        // this._config = null;
        // this._downAction = null;
        // this._upAction = null;
        // this._moveAction = null;
        // this._wheelAction = null;
    }

    protected _hasEditItem(): boolean {
        for (let index = 0; index < this._slideTabItems.length; index++) {
            const element = this._slideTabItems[index];
            if (element.isEditMode()) {
                return true;
            }
        }
        return false;
    }

    protected _autoScrollFrame(): void {
        if (this._activeTabItem) {
            this._compareDirection = this._activeTabItem.translateX(this._moveActionX);
            switch (this._compareDirection) {
                case 1: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareRight();
                    break;
                }
                case 0: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareIndex = this._activeTabItemIndex;
                    break;
                }
                case -1: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareLeft();
                    break;
                }
            }
        }
        this._autoScrollTime = requestAnimationFrame(() => {
            this._autoScrollFrame();
        });
    }

    protected _startAutoScroll(): void {
        if (this._autoScrollTime == null) {
            this._autoScrollFrame();
        }
    }

    protected _closeAutoScroll(): void {
        if (this._autoScrollTime) {
            cancelAnimationFrame(this._autoScrollTime);
        }
        this._autoScrollTime = null;
    }

    protected _scrollLeft(event: MouseEvent): void {
        const boundingRect = this.getBoundingRect();
        const x = event.pageX - boundingRect.x;
        if (x < this._leftBoundingLine) {
            this._scrollIncremental = -Math.min(Math.abs(x - this._leftBoundingLine) * 0.1, 50);
        }
    }

    protected _scrollRight(event: MouseEvent): void {
        const boundingRect = this.getBoundingRect();
        const x = event.pageX - boundingRect.x;
        if (x > boundingRect.width - this._rightBoundingLine) {
            this._scrollIncremental = Math.min(Math.abs(x - (boundingRect.width - this._rightBoundingLine)) * 0.1, 50);
        }
    }

    protected _sortedItems(): void {
        if (this._activeTabItem != null && this._activeTabItemIndex != null && this._compareIndex != null) {
            // data array list sort
            this._slideTabItems.splice(this._activeTabItemIndex, 1);
            this._slideTabItems.splice(this._compareIndex, 0, this._activeTabItem);

            // dom list sort
            if (this._config.slideTabBarItemAutoSort) {
                for (let i = 0; i < this._slideTabItems.length; i++) {
                    const item = this._slideTabItems[i];
                    const next = this._slideTabItems[i + 1];
                    if (next) {
                        item.after(next);
                    }
                }
            }
        }
    }

    protected _compareLeft(): void {
        if (this._activeTabItem && this._activeTabItemIndex) {
            const splice = this._slideTabItems.findIndex((item) => item.equals(this._activeTabItem));
            const length = this._slideTabItems.length;
            const collect = [];

            // collect compare item
            for (let i = 0; i < splice; i++) {
                if (i >= splice) {
                    break;
                }
                collect.push(this._slideTabItems[i]);
            }

            // reset right
            for (let i = splice + 1; i < length; i++) {
                this._slideTabItems[i].animate().translateX(0);
            }

            // diff item midline
            let notFound = true;
            for (let i = collect.length - 1; i >= 0; i--) {
                const item = collect[i];
                // Left side border reaches the midline
                if (SlideTabItem.leftLine(this._activeTabItem) < item.getMidLine()) {
                    item.animate().translateX(this._activeTabItem.getWidth());
                    this._compareIndex = i;
                    notFound = false;
                } else {
                    item.animate().translateX(0);
                    if (notFound) {
                        this._compareIndex = this._activeTabItemIndex;
                    }
                }
            }
        }
    }

    protected _compareRight(): void {
        if (this._activeTabItem) {
            const splice = this._slideTabItems.findIndex((item) => item.equals(this._activeTabItem));
            const length = this._slideTabItems.length;
            const collect = [];

            // collect compare item
            for (let i = splice + 1; i < length; i++) {
                collect.push(this._slideTabItems[i]);
            }

            // reset left
            for (let i = 0; i < splice; i++) {
                this._slideTabItems[i].animate().translateX(0);
            }

            // diff item midline
            let notFound = true;
            for (let i = 0; i < collect.length; i++) {
                const item = collect[i];
                // Right side border reaches the midline
                if (SlideTabItem.rightLine(this._activeTabItem) > item.getMidLine()) {
                    item.animate().translateX(-this._activeTabItem.getWidth());
                    this._compareIndex = splice + i + 1;
                    notFound = false;
                } else {
                    item.animate().translateX(0);
                    if (notFound) {
                        this._compareIndex = this._activeTabItemIndex;
                    }
                }
            }
        }
    }

    protected _initConfig(): void {
        const slideTabItems = this._slideTabBar.querySelectorAll(
            `.${this._config.slideTabBarItemClassName ?? 'slide-tab-item'}`
        );

        this._downActionX = 0;
        this._moveActionX = 0;
        this._compareDirection = 0;
        this._compareIndex = 0;

        this._slideTabItems = SlideTabItem.make(slideTabItems, this);
        this._activeTabItemIndex = this._config.currentIndex;
        this._activeTabItem = this._slideTabItems[this._activeTabItemIndex];
    }
}
