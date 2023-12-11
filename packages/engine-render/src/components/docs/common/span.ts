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

import type { Nullable } from '@univerjs/core';
import { BooleanNumber, BulletAlignment, DataStreamTreeTokenType as DT, GridType } from '@univerjs/core';

import { FontCache } from '../../../basics/font-cache';
import type {
    IDocumentSkeletonBullet,
    IDocumentSkeletonDivide,
    IDocumentSkeletonSpan,
} from '../../../basics/i-document-skeleton-cached';
import { SpanType } from '../../../basics/i-document-skeleton-cached';
import type { IFontCreateConfig } from '../../../basics/interfaces';
import { hasCJK, hasCJKText } from '../../../basics/tools';
import { validationGrid } from './tools';

export function createSkeletonWordSpan(
    content: string,
    config: IFontCreateConfig,
    spanWidth?: number
): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.WORD, content, config, spanWidth);
}

export function createSkeletonLetterSpan(
    content: string,
    config: IFontCreateConfig,
    spanWidth?: number
): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.LETTER, content, config, spanWidth);
}

export function createSkeletonTabSpan(config: IFontCreateConfig, spanWidth?: number): IDocumentSkeletonSpan {
    return _createSkeletonWordOrLetter(SpanType.TAB, DT.TAB, config, spanWidth);
}

export function _createSkeletonWordOrLetter(
    spanType: SpanType,
    content: string,
    config: IFontCreateConfig,
    spanWidth?: number
): IDocumentSkeletonSpan {
    const { fontStyle, textStyle, charSpace = 1, gridType = GridType.LINES, snapToGrid = BooleanNumber.FALSE } = config;
    const skipWidthList: string[] = [
        DT.SECTION_BREAK,
        DT.TABLE_START,
        DT.TABLE_END,
        DT.TABLE_ROW_START,
        DT.TABLE_ROW_END,
        DT.TABLE_CELL_START,
        DT.TABLE_CELL_END,
        DT.CUSTOM_RANGE_START,
        DT.CUSTOM_RANGE_END,
        DT.COLUMN_BREAK,
        DT.PAGE_BREAK,
        DT.DOCS_END,
        DT.CUSTOM_BLOCK,
    ];
    let streamType = DT.LETTER;

    if (skipWidthList.indexOf(content) > -1) {
        return {
            content: '',
            ts: textStyle,
            fontStyle,
            width: 0,
            bBox: {
                width: 0,
                ba: 0,
                bd: 0,
                aba: 0,
                abd: 0,
                sp: 0,
                sbr: 0,
                sbo: 0,
                spr: 0,
                spo: 0,
            },
            paddingLeft: 0,
            left: 0,
            spanType: SpanType.PLACEHOLDER,
            streamType: content as DT,
            count: 1,
        };
    }

    if (content === DT.PARAGRAPH) {
        streamType = DT.PARAGRAPH;
    }

    const bBox = FontCache.getTextSize(content, fontStyle);
    const { width: contentWidth = 0 } = bBox;
    let width = spanWidth ?? contentWidth;
    let paddingLeft = 0;

    if (validationGrid(gridType, snapToGrid)) {
        // 当文字也需要对齐到网格式，进行处理
        // const multiple = Math.ceil(contentWidth / charSpace);
        width = contentWidth + (hasCJK(content) ? charSpace : charSpace / 2);
        if (gridType === GridType.SNAP_TO_CHARS) {
            paddingLeft = (width - contentWidth) / 2;
        }
    }

    return {
        content,
        ts: textStyle,
        fontStyle,
        width,
        bBox,
        paddingLeft,
        left: 0,
        spanType,
        streamType,
        count: content.length,
    };
}

export function createSkeletonBulletSpan(
    span: IDocumentSkeletonSpan,
    bulletSkeleton: IDocumentSkeletonBullet,
    charSpaceApply: number
): IDocumentSkeletonSpan {
    const {
        bBox: boundingBox,
        symbol: content,
        ts: textStyle,
        fontStyle,
        bulletAlign = BulletAlignment.START,
        bulletType = false,
    } = bulletSkeleton;
    const contentWidth = boundingBox.width;
    // 当文字也需要对齐到网格式，进行处理, LINES默认参照是doc全局字体大小

    const multiple = Math.ceil(contentWidth / charSpaceApply);
    let width = (multiple < 2 ? 2 : multiple) * charSpaceApply; // 默认bullet有2个tab

    let left = 0;
    if (bulletType) {
        // 有序列表的处理，左对齐时left=0，其余情况根据contentWidth调整
        if (bulletAlign === BulletAlignment.CENTER) {
            left = -contentWidth / 2;
            width -= left;
        } else if (bulletAlign === BulletAlignment.END) {
            left = -contentWidth;
            width -= left;
        }
    }

    const bBox = _getMaxBoundingBox(span, bulletSkeleton);

    return {
        content,
        ts: textStyle,
        fontStyle,
        width,
        paddingLeft: 0,
        bBox,
        left,
        spanType: SpanType.LIST,
        streamType: DT.LETTER,
        // Deliberately set to 0 so that there is no need to count when calculating the cursor.
        count: 0,
    };
}

// Set the left value of the current span based on the width of pre span and the left value of the previous span.
export function setSpanGroupLeft(spanGroup: IDocumentSkeletonSpan[], left: number = 0) {
    const spanGroupLen = spanGroup.length;
    let preSpan;

    for (let i = 0; i < spanGroupLen; i++) {
        const span = spanGroup[i];
        span.left = preSpan ? preSpan.left + preSpan.width : left;

        preSpan = span;
    }
}

export function setSpanLeft(span: IDocumentSkeletonSpan, left: number = 0) {
    span.left = left;
}

export function addSpanToDivide(
    divide: IDocumentSkeletonDivide,
    spanGroup: IDocumentSkeletonSpan[],
    offsetLeft: number = 0
) {
    // const line = divide.parent;
    // if (line != null) {
    //     const isFirstLine = line.divides[0].spanGroup[0] == null;
    //     const firstSpan = spanGroup[0];
    //     const firstSpanContent = firstSpan.content || ' ';
    //     if (isFirstLine && firstSpanContent === ' ') {
    //         const width = firstSpan.width;
    //         firstSpan.width = 0;
    //         for (const span of spanGroup) {
    //             if (span === firstSpan) {
    //                 continue;
    //             }

    //             span.left -= width;
    //         }
    //     }
    // }

    setSpanGroupLeft(spanGroup, offsetLeft);

    // Set span parent pointer.
    for (const span of spanGroup) {
        span.parent = divide;
    }

    divide.spanGroup.push(...spanGroup);
}

function _getMaxBoundingBox(span: IDocumentSkeletonSpan, bulletSkeleton: IDocumentSkeletonBullet) {
    const { ba: spanAscent, bd: spanDescent } = span.bBox;
    const { ba: bulletAscent, bd: bulletDescent } = bulletSkeleton.bBox;

    if (spanAscent + spanDescent > bulletAscent + bulletDescent) {
        return span.bBox;
    }
    return bulletSkeleton.bBox;
}

export function hasMixedTextLayout(preSpan: Nullable<IDocumentSkeletonSpan>, span: IDocumentSkeletonSpan) {
    if (preSpan == null) {
        return false;
    }
    const { content: preContent } = preSpan;
    const { content: curContent } = span;

    if (preContent == null || curContent == null) {
        return false;
    }

    const ENG_NUMBERS_REG = /[a-z\d]/i;

    return (
        (ENG_NUMBERS_REG.test(preContent) && hasCJKText(curContent)) ||
        (hasCJKText(preContent) && ENG_NUMBERS_REG.test(curContent))
    );
}
