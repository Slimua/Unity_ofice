import {
    Direction,
    getReverseDirection,
    ICellData,
    IRange,
    ISelection,
    ISelectionCell,
    ObjectMatrix,
    RANGE_TYPE,
    Rectangle,
    selectionToArray,
    Worksheet,
} from '@univerjs/core';

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

export function getCellAtRowCol(row: number, col: number, worksheet: Worksheet): ISelectionCell {
    let destRange: ISelectionCell | null = null;

    const matrix = worksheet.getMatrixWithMergedCells(row, col, row, col);
    matrix.forValue((row, col, value) => {
        destRange = {
            actualRow: row,
            actualColumn: col,
            startRow: row,
            startColumn: col,
            isMerged: value.rowSpan !== undefined || value.colSpan !== undefined,
            isMergedMainCell: value.rowSpan !== undefined && value.colSpan !== undefined,
            endRow: row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
            endColumn: col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
            rangeType: RANGE_TYPE.NORMAL,
        };

        return false;
    });

    if (!destRange) {
        return {
            actualColumn: col,
            actualRow: row,
            startRow: row,
            startColumn: col,
            endRow: row,
            endColumn: col,
            isMerged: false,
            isMergedMainCell: false,
            rangeType: RANGE_TYPE.NORMAL,
        };
    }

    return destRange;
}

export function findNextRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const destRange: IRange = { ...startRange };
    switch (direction) {
        case Direction.UP:
            destRange.startRow = Math.max(0, startRange.startRow - 1);
            destRange.endRow = destRange.startRow;
            break;
        case Direction.DOWN:
            destRange.startRow = Math.min(startRange.endRow + 1, worksheet.getRowCount() - 1);
            destRange.endRow = destRange.startRow;
            break;
        case Direction.LEFT:
            destRange.startColumn = Math.max(0, startRange.startColumn - 1);
            destRange.endColumn = destRange.startColumn;
            break;
        case Direction.RIGHT:
            destRange.startColumn = Math.min(startRange.endColumn + 1, worksheet.getColumnCount() - 1);
            destRange.endColumn = destRange.startColumn;
            break;
        default:
            break;
    }

    return destRange;
}

export function findNextGapRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const destRange = { ...startRange };

    const lastRow = worksheet.getMaxRows() - 1;
    const lastColumn = worksheet.getMaxColumns() - 1;

    const { startRow, startColumn, endRow, endColumn } = getEdgeOfRange(startRange, direction, worksheet);

    let currentPositionHasValue = rangeHasValue(worksheet, startRow, startColumn, endRow, endColumn).hasValue;
    let firstMove = true;
    let shouldContinue = true;

    while (shouldContinue) {
        if (Direction.UP === direction) {
            if (destRange.startRow === 0) {
                shouldContinue = false;
                break;
            }

            const nextRow = destRange.startRow - 1; // it may decrease if there are merged cell
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                nextRow,
                destRange.startColumn,
                nextRow,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    // update searching ranges
                    let min = nextRow;
                    matrix.forValue((row) => {
                        min = Math.min(row, min);
                    });
                    destRange.startRow = min;
                } else {
                    destRange.startRow = nextRow;
                }

                destRange.endRow = destRange.startRow;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.DOWN === direction) {
            if (destRange.endRow === lastRow) {
                shouldContinue = false;
                break;
            }

            const nextRow = destRange.endRow + 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                nextRow,
                destRange.startColumn,
                nextRow,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let max = nextRow;
                    matrix.forValue((row, _, value) => {
                        max = Math.max(row + (value.rowSpan || 1) - 1, max);
                    });
                    destRange.endRow = max;
                } else {
                    destRange.endRow = nextRow;
                }

                destRange.startRow = destRange.endRow;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.LEFT === direction) {
            if (destRange.startColumn === 0) {
                shouldContinue = false;
                break;
            }

            const nextCol = destRange.startColumn - 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                destRange.startRow,
                nextCol,
                destRange.endRow,
                nextCol
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let min = nextCol;
                    matrix.forValue((_, col) => {
                        min = Math.min(col, min);
                    });
                    destRange.startColumn = min;
                } else {
                    destRange.startColumn = nextCol;
                }

                destRange.endColumn = destRange.startColumn;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.RIGHT === direction) {
            if (destRange.endColumn === lastColumn) {
                shouldContinue = false;
                break;
            }

            const nextCol = destRange.endColumn + 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                destRange.startRow,
                nextCol,
                destRange.endRow,
                nextCol
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let max = nextCol;
                    matrix.forValue((_, col, value) => {
                        max = Math.max(col + (value.colSpan || 1) - 1, max);
                    });
                    destRange.endColumn = max;
                } else {
                    destRange.endColumn = nextCol;
                }

                destRange.startColumn = destRange.endColumn;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }
    }

    return alignToMergedCellsBorders(destRange, worksheet, true);
}

export function expandToNextGapRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const next = findNextGapRange(startRange, direction, worksheet);
    return alignToMergedCellsBorders(Rectangle.union(next, startRange), worksheet, true);
}

/**
 * Adjust the range to align merged cell's borders.
 */
export function alignToMergedCellsBorders(startRange: IRange, worksheet: Worksheet, shouldRecursive = true) {
    const coveredMergedCells = worksheet.getMatrixWithMergedCells(...selectionToArray(startRange));
    const exceededMergedCells: IRange[] = [];

    coveredMergedCells.forValue((row, col, value) => {
        if (value.colSpan !== undefined && value.rowSpan !== undefined) {
            const mergedCellRange = {
                startRow: row,
                startColumn: col,
                endRow: row + value.rowSpan! - 1,
                endColumn: col + value.colSpan! - 1,
            };

            if (!Rectangle.contains(startRange, mergedCellRange)) {
                exceededMergedCells.push(mergedCellRange);
            }
        }
    });

    if (exceededMergedCells.length === 0) {
        return startRange;
    }

    const union = Rectangle.union(startRange, ...exceededMergedCells);
    if (shouldRecursive) {
        return alignToMergedCellsBorders(union, worksheet, shouldRecursive);
    }
    return union;
}

export function expandToNextCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const next = findNextRange(startRange, direction, worksheet);
    const destRange: IRange = {
        startRow: Math.min(startRange.startRow, next.startRow),
        startColumn: Math.min(startRange.startColumn, next.startColumn),
        endRow: Math.max(startRange.endRow, next.endRow),
        endColumn: Math.max(startRange.endColumn, next.endColumn),
    };

    return alignToMergedCellsBorders(Rectangle.union(startRange, destRange), worksheet);
}

/**
 * This function is considered as a reversed operation of `expandToNextGapCell` but there are slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextGapRange(
    startRange: IRange,
    anchorRange: IRange,
    direction: Direction,
    worksheet: Worksheet
): IRange {
    // use `moveToNextGapCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const nextGap = findNextGapRange(getEdgeOfRange(startRange, reversedDirection, worksheet), direction, worksheet);

    // if next exceed the startRange we should just expand anchorRange with
    if (direction === Direction.UP && nextGap.startRow <= startRange.startRow) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startColumn: startRange.startColumn, endColumn: startRange.endColumn },
            worksheet,
            true
        );
    }
    if (direction === Direction.DOWN && nextGap.endRow >= startRange.endRow) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startColumn: startRange.startColumn, endColumn: startRange.endColumn },
            worksheet,
            true
        );
    }
    if (direction === Direction.LEFT && nextGap.startColumn <= startRange.startColumn) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startRow: startRange.startRow, endRow: startRange.endRow },
            worksheet,
            true
        );
    }
    if (direction === Direction.RIGHT && nextGap.endColumn >= startRange.endColumn) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startRow: startRange.startRow, endRow: startRange.endRow },
            worksheet,
            true
        );
    }
    return Rectangle.union(Rectangle.clone(anchorRange), nextGap);
}

/**
 * This function is considered as a reversed operation of `expandToNextCell` but there are some slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    // use `moveToNextCell` reversely to get the next going to range
    const reversedDirection = getReverseDirection(direction);
    const shrinkFromEdge = getEdgeOfRange(startRange, reversedDirection, worksheet);
    const otherEdge = getEdgeOfRange(startRange, direction, worksheet);
    const next = findNextRange(shrinkFromEdge, direction, worksheet);
    return alignToMergedCellsBorders(Rectangle.union(otherEdge, next), worksheet, false);
}

export function expandToContinuousRange(startRange: IRange, directions: IExpandParams, worksheet: Worksheet): IRange {
    const { left, right, up, down } = directions;
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();

    let changed = true;
    const destRange: IRange = { ...startRange }; // startRange should not be used below

    while (changed) {
        changed = false;

        if (up && destRange.startRow !== 0) {
            // see if there are value in the upper row of contents
            // set `changed` to true if `startRow` really changes
            const destRow = destRange.startRow - 1; // it may decrease if there are merged cell
            const matrixFromLastRow = worksheet.getMatrixWithMergedCells(
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            // we should check if there are value in the upper row of contents, if it does
            // we should update the `destRange` and set `changed` to true
            matrixFromLastRow.forValue((row, col, value) => {
                if (value.v) {
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            });
        }

        if (down && destRange.endRow !== maxRow - 1) {
            const destRow = destRange.endRow + 1;
            const matrixFromLastRow = worksheet.getMatrixWithMergedCells(
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            matrixFromLastRow.forValue((row, col, value) => {
                if (value.v) {
                    destRange.endRow = Math.max(
                        row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
                        destRange.endRow
                    );
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            });
        }

        if (left && destRange.startRow !== 0) {
            const destCol = destRange.startColumn - 1;
            const matrixFromLastCol = worksheet.getMatrixWithMergedCells(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            matrixFromLastCol.forValue((row, col, value) => {
                if (value.v) {
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(row, destRange.endRow);
                    changed = true;
                }
            });
        }

        if (right && destRange.endColumn !== maxColumn - 1) {
            const destCol = destRange.endColumn + 1;
            const matrixFromLastCol = worksheet.getMatrixWithMergedCells(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            matrixFromLastCol.forValue((row, col, value) => {
                if (value.v) {
                    destRange.endColumn = Math.max(
                        col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
                        destRange.endColumn
                    );
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(row, destRange.endRow);
                    changed = true;
                }
            });
        }
    }

    return destRange;
}

export function expandToWholeSheet(worksheet: Worksheet): IRange {
    return {
        startRow: 0,
        startColumn: 0,
        endRow: worksheet.getMaxRows() - 1,
        endColumn: worksheet.getMaxColumns() - 1,
        rangeType: RANGE_TYPE.NORMAL,
    };
}

function getEdgeOfRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    let destRange: IRange;
    switch (direction) {
        case Direction.UP:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.startRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };

            break;
        case Direction.DOWN:
            destRange = {
                startRow: startRange.endRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
            break;
        case Direction.LEFT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.startColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
            break;
        case Direction.RIGHT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.endColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
            break;
        default:
            throw new Error('Invalid direction');
    }

    return alignToMergedCellsBorders(destRange, worksheet, false);
}

function rangeHasValue(
    worksheet: Worksheet,
    row: number,
    col: number,
    rowEnd: number,
    colEnd: number
): {
    hasValue: boolean;
    matrix: ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>;
} {
    let hasValue = false;

    const matrix = worksheet.getMatrixWithMergedCells(row, col, rowEnd, colEnd).forValue((_, __, value) => {
        if (value.v) {
            hasValue = true;
            return false; // stop looping
        }
    });

    return {
        hasValue,
        matrix,
    };
}

export function getStartRange(range: IRange, primary: ISelectionCell, direction: Direction): IRange {
    const ret = Rectangle.clone(range);

    switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
            ret.startColumn = ret.endColumn = primary.actualColumn;
            break;
        case Direction.LEFT:
        case Direction.RIGHT:
            ret.startRow = ret.endRow = primary.actualRow;
            break;
    }

    return ret;
}

export function checkIfShrink(selection: ISelection, direction: Direction, worksheet: Worksheet): boolean {
    const { primary, range } = selection;

    const startRange: IRange = Rectangle.clone(range);
    switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
            startRange.startRow = primary!.startRow;
            startRange.endRow = primary!.endRow;
            break;
        case Direction.LEFT:
        case Direction.RIGHT:
            startRange.startColumn = primary!.startColumn;
            startRange.endColumn = primary!.endColumn;
            break;
    }

    const anchorRange = getEdgeOfRange(startRange, direction, worksheet);
    switch (direction) {
        case Direction.DOWN:
            return range.startRow < anchorRange.startRow;
        case Direction.UP:
            return range.endRow > anchorRange.endRow;
        case Direction.LEFT:
            return anchorRange.endColumn < range.endColumn;
        case Direction.RIGHT:
            return anchorRange.startColumn > range.startColumn;
    }
}
