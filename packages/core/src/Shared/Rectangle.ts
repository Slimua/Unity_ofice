import { ISelectionRange } from '../Types/Interfaces/ISelectionRange';
import { Nullable } from './Types';

/**
 * This class provides a set of methods to calculate `ISelectionRange`.
 */
export class Rectangle {
    static equals(src: ISelectionRange, target: ISelectionRange): boolean {
        return (
            src.endRow === target.endRow &&
            src.endColumn === target.endColumn &&
            src.startRow === target.startRow &&
            src.startColumn === target.startColumn
        );
    }

    static intersects(src: ISelectionRange, target: ISelectionRange): boolean {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        const zx = Math.abs(currentStartColumn + currentEndColumn - incomingStartColumn - incomingEndColumn);
        const x = Math.abs(currentStartColumn - currentEndColumn) + Math.abs(incomingStartColumn - incomingEndColumn);
        const zy = Math.abs(currentStartRow + currentEndRow - incomingStartRow - incomingEndRow);
        const y = Math.abs(currentStartRow - currentEndRow) + Math.abs(incomingStartRow - incomingEndRow);

        return zx <= x && zy <= y;
    }

    static getIntersects(src: ISelectionRange, target: ISelectionRange): Nullable<ISelectionRange> {
        const currentStartRow = src.startRow;
        const currentEndRow = src.endRow;
        const currentStartColumn = src.startColumn;
        const currentEndColumn = src.endColumn;

        const incomingStartRow = target.startRow;
        const incomingEndRow = target.endRow;
        const incomingStartColumn = target.startColumn;
        const incomingEndColumn = target.endColumn;

        let startColumn;
        let startRow;
        let endColumn;
        let endRow;
        if (incomingStartRow <= currentEndRow) {
            if (incomingStartRow >= currentStartRow) {
                startRow = incomingStartRow;
            } else {
                startRow = currentStartRow;
            }
        } else {
            return null;
        }

        if (incomingEndRow >= currentStartRow) {
            if (incomingEndRow >= currentEndRow) {
                endRow = currentEndRow;
            } else {
                endRow = incomingEndRow;
            }
        } else {
            return null;
        }

        if (incomingStartColumn <= currentEndColumn) {
            if (incomingStartColumn > currentStartColumn) {
                startColumn = incomingStartColumn;
            } else {
                startColumn = currentStartColumn;
            }
        } else {
            return null;
        }

        if (incomingEndColumn >= currentStartColumn) {
            if (incomingEndColumn >= currentEndColumn) {
                endColumn = currentEndColumn;
            } else {
                endColumn = incomingEndColumn;
            }
        } else {
            return null;
        }

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
        };
    }

    static subtract(src: ISelectionRange, target: ISelectionRange): Nullable<ISelectionRange[]> {
        const intersected = Rectangle.getIntersects(src, target);
        if (!intersected) {
            return [src];
        }

        const result: ISelectionRange[] = [];
        const { startRow, endRow, startColumn, endColumn } = intersected;
        const { startRow: srcStartRow, endRow: srcEndRow, startColumn: srcStartColumn, endColumn: srcEndColumn } = src;

        // subtract could result in eight pieces and these eight pieces and be merged to at most four pieces
    }

    static contains(src: ISelectionRange, target: ISelectionRange): boolean {
        return (
            src.startRow <= target.startRow &&
            src.endRow >= target.endRow &&
            src.startColumn <= target.startColumn &&
            src.endColumn >= target.endColumn
        );
    }

    static realContain(src: ISelectionRange, target: ISelectionRange): boolean {
        return (
            Rectangle.contains(src, target) &&
            (src.startRow < target.startRow ||
                src.endRow > target.endRow ||
                src.startColumn < target.startColumn ||
                src.endColumn > target.endColumn)
        );
    }

    static union(...ranges: ISelectionRange[]): ISelectionRange {
        return ranges.reduce(
            (acc, current) => ({
                startRow: Math.min(acc.startRow, current.startRow),
                startColumn: Math.min(acc.startColumn, current.startColumn),
                endRow: Math.max(acc.endRow, current.endRow),
                endColumn: Math.max(acc.endColumn, current.endColumn),
            }),
            ranges[0]
        );
    }

    // /**
    //  * @deprecated use static methods
    //  * @param rectangle
    //  * @returns
    //  */
    // intersects(rectangle: Rectangle): boolean {
    //     return Rectangle.intersects(this, rectangle);
    // }

    // /**
    //  * @deprecated use static methods
    //  * @param rectangle
    //  * @returns
    //  */
    // union(rectangle: Rectangle) {
    //     const { startRow, startColumn, endRow, endColumn } = this;
    //     return new Rectangle(
    //         rectangle.startRow < this.startRow ? rectangle.startRow : startRow,
    //         rectangle.startColumn < startColumn ? rectangle.startColumn : startColumn,
    //         rectangle.endRow > endRow ? rectangle.endRow : endRow,
    //         rectangle.endColumn > endColumn ? rectangle.endColumn : endColumn
    //     );
    // }

    // getData() {
    //     return {
    //         startRow: this.startRow,
    //         startColumn: this.startColumn,
    //         endRow: this.endRow,
    //         endColumn: this.endColumn,
    //     };
    // }
}
