import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    GridType,
    INumberUnit,
    Nullable,
    NumberUnitType,
    ObjectPositionH,
    ObjectPositionV,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    SpacingRule,
    DataStreamTreeNode,
    IParagraphStyle,
    ITextStyle,
    ObjectMatrix,
    DocumentBodyModel,
} from '@univerjs/core';
import {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSpan,
    SpanType,
} from '../../../Basics/IDocumentSkeletonCached';
import { getFontStyleString, isFunction } from '../../../Basics/Tools';
import { DEFAULT_DOCUMENT_FONTSIZE } from '../../../Basics/Const';
import { IParagraphConfig, ISectionBreakConfig } from '../../../Basics/Interfaces';

export function getLastPage(pages: IDocumentSkeletonPage[]) {
    return pages?.[pages.length - 1];
}

export function getLastSection(page: IDocumentSkeletonPage) {
    return page?.sections?.[page.sections.length - 1];
}

export function getLastColumn(page: IDocumentSkeletonPage) {
    const columns = getLastSection(page).columns;
    return columns?.[columns.length - 1];
}

export function getLastLine(page: IDocumentSkeletonPage) {
    const lines = getLastNotFullColumnInfo(page)?.column.lines;
    return lines?.[lines.length - 1];
}

export function getLastLineByColumn(column: IDocumentSkeletonColumn) {
    return column.lines[column.lines.length - 1];
}

export function getPageContentWidth(page: IDocumentSkeletonPage) {
    const { width: pageWidth, marginLeft: pageMarginLeft, marginRight: pageMarginRight } = page;
    const pageContentWidth = pageWidth - pageMarginLeft - pageMarginRight;
    return pageContentWidth;
}

export function getPreLine(line: IDocumentSkeletonLine) {
    const column = line.parent;
    const index = column?.lines.indexOf(line);
    if (!index || index === -1 || index - 1 < 0) {
        return;
    }

    return column?.lines[index - 1];
}

export function getColumnByDivide(divide: IDocumentSkeletonDivide) {
    const column = divide.parent?.parent;
    if (column) {
        return column;
    }
}

export function getLastNotFullColumnInfo(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    for (let i = 0; i < section.columns.length; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return {
                column,
                isLast: i === section.columns.length - 1,
                index: i,
            };
        }
    }
}

export function getLastNotFullDivideInfo(page: IDocumentSkeletonPage) {
    const line = getLastLine(page);
    if (!line) {
        return;
    }
    for (let i = 0; i < line.divides.length; i++) {
        const divide = line.divides[i];
        if (!divide.isFull) {
            return {
                divide,
                isLast: i === line.divides.length - 1,
                index: i,
            };
        }
    }
}

export function getNextDivide(curLine: IDocumentSkeletonLine, curDivide: IDocumentSkeletonDivide) {
    const index = curLine.divides.indexOf(curDivide);
    if (index === -1) {
        return;
    }
    return curLine.divides[index + 1];
}

export function getLastRemainingDivide(curLine: IDocumentSkeletonLine) {
    // 除了divide之外，其他元素不会提前create
    if (!curLine) {
        return;
    }
    for (let i = 0; i < curLine.divides.length; i++) {
        const curDivide = curLine.divides[i];
        const nextDivide = curLine.divides[i + 1];
        if (curDivide.spanGroup.length === 0) {
            return curDivide;
        }
        if (!nextDivide || nextDivide.spanGroup.length === 0) {
            return curDivide;
        }
    }
}

export function getLastSpan(page: IDocumentSkeletonPage) {
    const spanGroup = getLastNotFullDivideInfo(page)?.divide.spanGroup;
    return spanGroup?.[spanGroup.length - 1];
}

export function isColumnFull(page: IDocumentSkeletonPage) {
    const section = getLastSection(page);
    const columnsLen = section.columns.length;
    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        if (!column.isFull) {
            return false;
        }
    }
    return true;
}

export function isBlankPage(page: IDocumentSkeletonPage) {
    if (page.sections.length > 1) {
        return false;
    }

    const section = getLastSection(page);

    const columnsLen = section.columns.length;

    for (let i = 0; i < columnsLen; i++) {
        const column = section.columns[i];
        const state = isBlankColumn(column);
        if (!state) {
            return false;
        }
    }

    return true;
}

export function isBlankColumn(column: IDocumentSkeletonColumn) {
    const lines = column.lines;
    if (lines.length > 1) {
        return false;
    }

    const line = lines[lines.length - 1];

    return isLineBlank(line);
}

function isLineBlank(line?: IDocumentSkeletonLine) {
    if (!line) {
        return true;
    }

    for (let i = 0; i < line.divides.length; i++) {
        const spanCount = line.divides[i].spanGroup.length;
        if (spanCount > 1) {
            return false;
        }
        if (spanCount === 1) {
            const lastSpan = line.divides[i].spanGroup[0];
            const { spanType } = lastSpan;
            if (spanType !== SpanType.TAB && spanType !== SpanType.LIST) {
                return false;
            }
        }
    }

    return true;
}

// 重新计算图文混排的布局，每一个TR或者同层级处理函数都要调用这个方法
export function reCalculateLineDivide() {}

export function getNumberUnitValue(unitValue: number | INumberUnit, benchMark: number) {
    if (unitValue instanceof Object) {
        const { v: value, u: unit } = unitValue;
        if (unit === NumberUnitType.POINT) {
            return value;
        }

        return value * benchMark;
    }

    return unitValue;
}

// 返回charSpaceApply，选择网格还是字体来计算一个tab的长度，一个tab代表1字符长度
export function getCharSpaceApply(charSpace: number = 0, defaultTabStop: number, gridType = GridType.LINES, snapToGrid = BooleanNumber.TRUE) {
    let charSpaceApply = 1;

    if (validationGrid(gridType, snapToGrid)) {
        // 启用了char网格的情况下，defaultTabStop的参照物是charSpace
        charSpaceApply = charSpace;
    }
    charSpaceApply *= defaultTabStop; // 乘以defaultTabStop设置的数值
    return charSpaceApply;
}

export function validationGrid(gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE) {
    return snapToGrid === BooleanNumber.TRUE && (gridType === GridType.LINES_AND_CHARS || gridType === GridType.SNAP_TO_CHARS);
}

export function getLineHeightConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {} } = paragraphConfig;

    const { linePitch = 15.6, gridType = GridType.LINES, paragraphLineGapDefault = 0 } = sectionBreakConfig;

    const { lineSpacing = 1, spacingRule = SpacingRule.AUTO, snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    return { paragraphLineGapDefault, linePitch, gridType, lineSpacing, spacingRule, snapToGrid };
}

export function getCharSpaceConfig(sectionBreakConfig: ISectionBreakConfig, paragraphConfig: IParagraphConfig) {
    const { paragraphStyle = {} } = paragraphConfig;

    const { charSpace = 0, gridType = GridType.LINES, defaultTabStop = 36, documentTextStyle = {} } = sectionBreakConfig;

    const { fs: documentFontSize = DEFAULT_DOCUMENT_FONTSIZE } = documentTextStyle;

    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    return {
        charSpace,
        documentFontSize,
        defaultTabStop,
        gridType,
        snapToGrid,
    };
}

// eslint-disable-next-line max-lines-per-function
export function updateBlockIndex(pages: IDocumentSkeletonPage[], start: number = -1) {
    const firstPage = pages[0];
    const { st: firstPageStartIndex } = firstPage;
    // if (firstPageStartIndex > endIndex) {
    //     console.error(`pageStartIndex ${firstPageStartIndex} is large than element endIndex ${endIndex}`);
    //     return;
    // }

    let prePageStartIndex = start;
    for (const page of pages) {
        const { sections } = page;
        const pageStartIndex = prePageStartIndex;
        const pageEndIndex = pageStartIndex;
        let preSectionStartIndex = pageStartIndex;
        let maxPageWidth = -Infinity;
        let pageHeight = 0;
        for (const section of sections) {
            const { columns } = section;
            const sectionStartIndex = preSectionStartIndex;
            const sectionEndIndex = pageStartIndex;
            let preColumnStartIndex = sectionStartIndex;
            let maxSectionHeight = -Infinity;
            for (const column of columns) {
                const { lines } = column;
                const columStartIndex = preColumnStartIndex;
                const columnEndIndex = columStartIndex;
                let preLineStartIndex = columStartIndex;
                let columnHeight = 0;
                let maxColumnWidth = -Infinity;
                let preLine: Nullable<IDocumentSkeletonLine> = null;
                for (const line of lines) {
                    const { divides, lineHeight } = line;
                    const lineStartIndex = preLineStartIndex;
                    const lineEndIndex = lineStartIndex;
                    let preDivideStartIndex = lineStartIndex;
                    let actualWidth = 0;
                    let maxLineAsc = 0;
                    columnHeight += lineHeight;
                    const divideLength = divides.length;
                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { spanGroup } = divide;

                        if (spanGroup.length === 0) {
                            continue;
                        }

                        const divStartIndex = preDivideStartIndex;
                        let divEndIndex = divStartIndex;
                        for (const span of spanGroup) {
                            const increaseValue = span.spanType === SpanType.LIST ? 0 : span.count || 1;
                            // pageEndIndex += increaseValue;
                            // sectionEndIndex += increaseValue;
                            // columnEndIndex += increaseValue;
                            // lineEndIndex += increaseValue;
                            divEndIndex += increaseValue;

                            // console.log('span', span, increaseValue, divEndIndex);

                            const bBox = span.bBox;
                            const { ba } = bBox;

                            maxLineAsc = Math.max(maxLineAsc, ba);

                            if (i === divideLength - 1 && divide.width === Infinity) {
                                // 宽度为Infinity时，最后一个divide也是Infinity，需要计算一个实际宽度。
                                actualWidth += span.width;
                            }
                        }

                        if (i === divideLength - 1) {
                            if (divide.width === Infinity) {
                                divide.width = actualWidth;
                            } else {
                                actualWidth += divide.width;
                            }
                            actualWidth += divide.left;
                        }

                        divide.st = divStartIndex === 0 ? 0 : divStartIndex + 1;
                        divide.ed = divEndIndex >= divide.st ? divEndIndex : divide.st;
                        preDivideStartIndex = divide.ed;
                        // console.log('divide', divide, divide.st, divide.ed);
                    }
                    line.st = lineStartIndex === 0 ? 0 : lineStartIndex + 1;
                    line.ed = preDivideStartIndex >= line.st ? preDivideStartIndex : line.st;
                    line.width = actualWidth;
                    line.asc = maxLineAsc;
                    maxColumnWidth = Math.max(maxColumnWidth, actualWidth);
                    line.top = (preLine?.top || 0) + (preLine?.lineHeight || 0);
                    preLine = line;
                    preLineStartIndex = line.ed;
                }
                column.st = columStartIndex === 0 ? 0 : columStartIndex + 1;
                column.ed = preLineStartIndex >= column.st ? preLineStartIndex : column.st;
                column.height = columnHeight;
                if (column.width === Infinity) {
                    column.width = maxColumnWidth;
                }
                maxPageWidth = Math.max(maxPageWidth, maxColumnWidth);
                maxSectionHeight = Math.max(maxSectionHeight, column.height);

                preColumnStartIndex = column.ed;
            }

            section.st = sectionStartIndex === 0 ? 0 : sectionStartIndex + 1;
            section.ed = preColumnStartIndex >= section.st ? preColumnStartIndex : section.st;
            section.height = maxSectionHeight;
            pageHeight += maxSectionHeight;

            preSectionStartIndex = section.ed;
        }

        page.st = pageStartIndex === 0 ? 0 : pageStartIndex + 1;
        page.ed = preSectionStartIndex >= page.st ? preSectionStartIndex : page.st;
        page.height = pageHeight;
        page.width = maxPageWidth;

        prePageStartIndex = page.ed;
    }
}

export function spanIterator(pages: IDocumentSkeletonPage[], iteratorFunction: (span: IDocumentSkeletonSpan) => void) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    const { divides, lineHeight } = line;
                    const divideLength = divides.length;
                    for (let i = 0; i < divideLength; i++) {
                        const divide = divides[i];
                        const { spanGroup } = divide;

                        for (const span of spanGroup) {
                            if (iteratorFunction && isFunction(iteratorFunction)) {
                                iteratorFunction(span);
                            }
                        }
                    }
                }
            }
        }
    }
}

export function lineIterator(pages: IDocumentSkeletonPage[], iteratorFunction: (line: IDocumentSkeletonLine) => void) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                const { lines } = column;

                for (const line of lines) {
                    if (iteratorFunction && isFunction(iteratorFunction)) {
                        iteratorFunction(line);
                    }
                }
            }
        }
    }
}

export function columnIterator(pages: IDocumentSkeletonPage[], iteratorFunction: (column: IDocumentSkeletonColumn) => void) {
    for (const page of pages) {
        const { sections } = page;

        for (const section of sections) {
            const { columns } = section;

            for (const column of columns) {
                if (iteratorFunction && isFunction(iteratorFunction)) {
                    iteratorFunction(column);
                }
            }
        }
    }
}

// eslint-disable-next-line max-lines-per-function
export function getPositionHorizon(positionH: ObjectPositionH, column: IDocumentSkeletonColumn, page: IDocumentSkeletonPage, objectWidth: number, isPageBreak: boolean = false) {
    const { relativeFrom, align, posOffset, percent } = positionH;

    if (align != null) {
        if (align === AlignTypeH.INSIDE || align === AlignTypeH.OUTSIDE) {
            if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                // TODO
            }
        } else {
            if (relativeFrom === ObjectRelativeFromH.COLUMN) {
                const { width, left } = column;
                let absoluteLeft = 0;
                if (align === AlignTypeH.LEFT) {
                    absoluteLeft = left;
                } else if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = left + width - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = left + width / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
            if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
                // TODO
            } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
                const { width } = page;
                let absoluteLeft = 0;
                if (align === AlignTypeH.RIGHT) {
                    absoluteLeft = width - objectWidth;
                } else if (align === AlignTypeH.CENTER) {
                    absoluteLeft = width / 2 - objectWidth / 2;
                }
                return absoluteLeft;
            }
        }
    } else if (posOffset) {
        const { width: pageWidth, marginLeft, marginRight } = page;
        const boundaryLeft = marginLeft;
        const boundaryRight = pageWidth - marginRight;

        let absoluteLeft = 0;
        if (relativeFrom === ObjectRelativeFromH.COLUMN) {
            absoluteLeft = (isPageBreak ? 0 : column?.left || 0) + posOffset;
        } else if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            absoluteLeft = posOffset + marginLeft;
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            absoluteLeft = posOffset;
        }

        if (absoluteLeft + objectWidth > boundaryRight) {
            absoluteLeft = boundaryRight - objectWidth;
        }
        return absoluteLeft;
    } else if (percent) {
        const { width: pageWidth, marginLeft, marginRight } = page;
        if (relativeFrom === ObjectRelativeFromH.LEFT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.RIGHT_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            return percent * pageWidth;
        }
    }
}

export function getPositionVertical(
    positionV: ObjectPositionV,
    page: IDocumentSkeletonPage,
    lineTop: number,
    lineHeight: number,
    objectHeight: number,
    blockAnchorTop?: number,
    isPageBreak: boolean = false
) {
    const { relativeFrom, align, posOffset, percent } = positionV;

    if (align != null) {
        if (relativeFrom === ObjectRelativeFromV.LINE) {
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = lineTop + lineHeight - objectHeight;
            } else if (align === AlignTypeV.TOP) {
                absoluteTop = lineTop;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = lineTop + lineHeight / 2 - objectHeight / 2;
            }
            return absoluteTop;
        }
        if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            const { height } = page;
            let absoluteTop = 0;
            if (align === AlignTypeV.BOTTOM) {
                absoluteTop = height - objectHeight;
            } else if (align === AlignTypeV.CENTER) {
                absoluteTop = height / 2 - objectHeight / 2;
            }
            return absoluteTop;
        }
    } else if (posOffset) {
        let absoluteTop = 0;
        if (relativeFrom === ObjectRelativeFromV.LINE) {
            absoluteTop = lineTop || 0 + posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            absoluteTop = posOffset;
        } else if (relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
            absoluteTop = (isPageBreak ? 0 : blockAnchorTop == null ? lineTop : blockAnchorTop) + posOffset;
        }
        return absoluteTop;
    } else if (percent) {
        const { height: pageHeight, marginBottom, marginTop } = page;
        if (relativeFrom === ObjectRelativeFromV.TOP_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.BOTTOM_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.INSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.OUTSIDE_MARGIN) {
            // TODO
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            return percent * pageHeight;
        }
    }
}

export function getPositionHorizonBySpan(positionH: ObjectPositionH, span: IDocumentSkeletonSpan) {
    const { relativeFrom, align, posOffset, percent } = positionH;
}

export function getSpanGroupWidth(divide: IDocumentSkeletonDivide) {
    const spanGroup = divide.spanGroup;
    let width = 0;
    for (const span of spanGroup) {
        width += span.width;
    }
    return width;
}

interface IFontCreateConfig {
    fontStyle: {
        fontString: string;
        fontSize: number;
        fontFamily: string;
    };
    textStyle: ITextStyle;
    charSpace: number;
    gridType: GridType;
    snapToGrid: BooleanNumber;
    pageWidth: number;
}

const fontCreateConfigCache = new ObjectMatrix<IFontCreateConfig>();

export function clearFontCreateConfigCache() {
    fontCreateConfigCache.reset();
}

export function getFontCreateConfig(
    index: number,
    bodyModel: DocumentBodyModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const { startIndex } = paragraphNode;
    const textRun = bodyModel.getTextRun(index + startIndex) || { ts: {}, st: 0, ed: 0 };
    const { ts: textStyle = {}, st, ed } = textRun;
    const cache = fontCreateConfigCache.getValue(st, ed);
    if (cache) {
        return cache;
    }

    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        pageSize = {
            width: Infinity,
            height: Infinity,
        },

        marginRight = 0,
        marginLeft = 0,
        fontLocale,
    } = sectionBreakConfig;

    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;

    const fontStyle = getFontStyleString(textStyle, fontLocale);

    const mixTextStyle: ITextStyle = {
        ...documentTextStyle,
        ...textStyle,
    };

    const pageWidth = pageSize.width || Infinity - marginLeft - marginRight;

    const result = {
        fontStyle,
        textStyle: mixTextStyle,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    fontCreateConfigCache.setValue(st, ed, result);

    return result;
}
