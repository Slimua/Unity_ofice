import {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    IDocumentSkeletonSpan,
    PageLayoutType,
} from '../../../Basics/IDocumentSkeletonCached';

export class Liquid {
    private _translateX: number = 0;

    private _translateY: number = 0;

    private _translateSaveList: Array<{ x: number; y: number }> = [];

    get x() {
        return this._translateX;
    }

    get y() {
        return this._translateY;
    }

    reset() {
        this.translateBy(0, 0);
        this._translateSaveList = [];
    }

    translateBy(x: number = 0, y: number = 0) {
        this._translateX = x;
        this._translateY = y;
    }

    translate(x: number = 0, y: number = 0) {
        this._translateX += x;
        this._translateY += y;
    }

    translateSave() {
        this._translateSaveList.push({
            x: this._translateX,
            y: this._translateY,
        });
    }

    translateRestore() {
        const save = this._translateSaveList.pop();
        if (save) {
            this._translateX = save.x;
            this._translateY = save.y;
        }
    }

    // const {
    //     verticalAlign = VerticalAlign.TOP,
    //     horizontalAlign = HorizontalAlign.LEFT,
    //     centerAngle: centerAngleDeg = 0,
    //     vertexAngle: vertexAngleDeg = 0,
    //     wrapStrategy = WrapStrategy.UNSPECIFIED,
    //     isRotateNonEastAsian = BooleanNumber.FALSE,
    // } = renderConfig;

    // let paddingTop = 0;

    // if (verticalAlign === VerticalAlign.MIDDLE && pageHeight !== Infinity) {
    //     paddingTop = (pageHeight - height) / 2;
    // } else if (verticalAlign === VerticalAlign.BOTTOM && pageHeight !== Infinity) {
    //     paddingTop = pageHeight - height - pagePaddingBottom;
    // } else {
    //     paddingTop = pagePaddingTop;
    // }

    // let paddingLeft = 0;

    // if (horizontalAlign === HorizontalAlign.CENTER && pageWidth !== Infinity) {
    //     paddingLeft = (pageWidth - width) / 2;
    // } else if (horizontalAlign === HorizontalAlign.RIGHT && pageWidth !== Infinity) {
    //     paddingLeft = pageWidth - width - pagePaddingRight;
    // } else {
    //     paddingLeft = pagePaddingLeft;
    // }
    translatePagePadding(page: IDocumentSkeletonPage) {
        const {
            marginTop: pagePaddingTop = 0,
            marginBottom: pagePaddingBottom = 0,
            marginLeft: pagePaddingLeft = 0,
            marginRight: pagePaddingRight = 0,
        } = page;

        this.translate(pagePaddingLeft, pagePaddingTop);
    }

    restorePagePadding(page: IDocumentSkeletonPage) {
        const {
            marginTop: pagePaddingTop = 0,
            marginBottom: pagePaddingBottom = 0,
            marginLeft: pagePaddingLeft = 0,
            marginRight: pagePaddingRight = 0,
        } = page;

        this.translate(-pagePaddingLeft, -pagePaddingTop);
    }

    translatePage(
        page: IDocumentSkeletonPage,
        type = PageLayoutType.VERTICAL,
        left = 0,
        top = 0,
        right = 0,
        bottom = 0
    ) {
        const {
            sections,
            marginTop: pagePaddingTop = 0,
            marginBottom: pagePaddingBottom = 0,
            marginLeft: pagePaddingLeft = 0,
            marginRight: pagePaddingRight = 0,
            pageWidth,
            pageHeight,
            width,
            height,
            pageNumber = 1,
            renderConfig = {},
        } = page;

        let pageTop = 0;

        let pageLeft = 0;

        if (type === PageLayoutType.VERTICAL) {
            pageTop += pageHeight + top;
        } else if (type === PageLayoutType.HORIZONTAL) {
            pageLeft += pageWidth + left;
        }

        this.translate(pageLeft, pageTop);

        return {
            x: pageLeft,
            y: pageTop,
        };
    }

    translateSection(section: IDocumentSkeletonSection) {
        const { top: sectionTop = 0 } = section;
        this.translate(0, sectionTop);
        return {
            x: 0,
            y: sectionTop,
        };
    }

    translateColumn(column: IDocumentSkeletonColumn) {
        const { left: columnLeft } = column;

        this.translate(columnLeft, 0);

        return {
            x: columnLeft,
            y: 0,
        };
    }

    translateLine(line: IDocumentSkeletonLine, isDraw = false) {
        const {
            top: lineTop,
            marginBottom: lineMarginBottom = 0,
            marginTop: lineMarginTop = 0,
            paddingTop: linePaddingTop = 0,
            paddingBottom: linePaddingBottom = 0,
        } = line;
        const lineOffset = lineTop + (isDraw === true ? lineMarginTop : 0) + linePaddingTop;
        this.translate(0, lineOffset);
        return {
            x: 0,
            y: lineOffset,
        };
    }

    translateDivide(divide: IDocumentSkeletonDivide) {
        const { left: divideLeft, paddingLeft: dividePaddingLeft } = divide;
        const left = divideLeft + dividePaddingLeft;
        this.translate(left, 0);

        return {
            x: left,
            y: 0,
        };
    }

    translateSpan(span: IDocumentSkeletonSpan) {
        const { left: spanLeft } = span;
        this.translate(spanLeft, 0);

        return {
            x: spanLeft,
            y: 0,
        };
    }
}
