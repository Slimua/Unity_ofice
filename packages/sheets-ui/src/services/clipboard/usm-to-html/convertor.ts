import type { ICellData, IRange, ObjectMatrix } from '@univerjs/core';

import type { ICellDataWithSpanInfo, IClipboardPropertyItem, ISheetClipboardHook } from '../type';

/**
 *
 * @param row index of the copied row
 * @param cols
 * @param hooks
 * @returns
 */
function getRowContent(
    row: number,
    cols: number[],
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>
) {
    const properties = hooks.map((hook) => hook.onCopyRow?.(row)).filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const tds = cols
        .map((col) => getTDContent(row, col, hooks, matrix))
        .filter((v) => !!v)
        .join('');

    return `<tr${str}>${tds}</tr>`;
}

/**
 * Get content of a single td element.
 * @param row index of the copied cell
 * @param col index of the copied cell
 * @returns
 */
function getTDContent(
    row: number,
    col: number,
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>
) {
    const v = matrix.getValue(row, col);
    const properties = hooks
        .map((hook) => hook.onCopyCellStyle?.(row, col, v?.rowSpan, v?.colSpan))
        .filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const content = hooks.reduce((acc, hook) => acc || hook.onCopyCellContent?.(row, col) || '', '');

    return `<td${str}>${content}</td>`;
}

function getColStyle(cols: number[], hooks: ISheetClipboardHook[]) {
    const str = cols
        .map((col) => {
            const properties = hooks
                .map((hook) => hook.onCopyColumn?.(col))
                .filter((v) => !!v) as IClipboardPropertyItem[];
            const mergedProperties = mergeProperties(properties);
            const str = zipClipboardPropertyItemToString(mergedProperties);
            return `<col ${str}>`;
        })
        .join('');

    return `<colgroup>${str}</colgroup>`;
}

function mergeProperties(properties: IClipboardPropertyItem[]): IClipboardPropertyItem {
    return properties.reduce((acc, cur) => {
        const keys = Object.keys(cur);
        keys.forEach((key) => {
            if (!acc[key]) {
                acc[key] = cur[key];
            } else {
                acc[key] += `;${cur[key]}`;
            }
        });
        return acc;
    }, {});
}

function zipClipboardPropertyItemToString(item: IClipboardPropertyItem) {
    return Object.keys(item).reduce((acc, cur) => {
        acc += ` ${cur}="${item[cur]}"`;
        return acc;
    }, '');
}

function getArrayFromTo(f: number, to: number): number[] {
    const arr: number[] = [];
    for (let i = f; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}

export class USMToHtmlService {
    convert(
        matrix: ObjectMatrix<
            ICellData & {
                rowSpan?: number | undefined;
                colSpan?: number | undefined;
            }
        >,
        range: IRange,
        hooks: ISheetClipboardHook[]
    ): string {
        const { startColumn, endColumn } = range;
        const colStyles = getColStyle(getArrayFromTo(startColumn, endColumn), hooks);
        // row styles and table contents
        const rowContents: string[] = [];

        matrix.forRow((row, cols) => {
            // TODO: cols here should filtered out those in span cells
            rowContents.push(getRowContent(row, cols, hooks, matrix));
        });

        const html = `<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none">${colStyles}
<tbody>${rowContents.join('')}</tbody></table>`;
        return html;
    }
}
