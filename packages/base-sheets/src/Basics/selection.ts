import { TinyColor } from '@ctrl/tinycolor';
import { getCellInfoInMergeData } from '@univerjs/base-render';
import {
    IRange,
    ISelection,
    ISelectionWithCoord,
    makeCellRangeToRangeData,
    Nullable,
    ThemeService,
} from '@univerjs/core';

export const SELECTION_CONTROL_BORDER_BUFFER_WIDTH = 4; // The draggable range of the selection is too thin, making it easy for users to miss. Therefore, a buffer gap is provided to make it easier for users to select.

export const SELECTION_CONTROL_BORDER_BUFFER_COLOR = 'rgba(255,255,255, 0.01)';

/**
 * Whether to display the controller that modifies the selection, distributed in 8 locations
 * tl top_left_corner
 * tc top_center_corner
 * tr top_right_corner
 * ml middle_left_corner
 * mr middle_right_corner
 * bl bottom_left_corner
 * bc bottom_center_corner
 * br bottom_right_corner
 */
export interface ISelectionWidgetConfig {
    tl?: boolean;
    tc?: boolean;
    tr?: boolean;
    ml?: boolean;
    mr?: boolean;
    bl?: boolean;
    bc?: boolean;
    br?: boolean;
}

/**
 * https://support.microsoft.com/en-us/office/select-cell-contents-in-excel-23f64223-2b6b-453a-8688-248355f10fa9
 */
export interface ISelectionStyle {
    strokeWidth: number; // The volume of the selection border determines the thickness of the selection border
    stroke: string; // The color of the selection border.
    strokeDash?: number; // The dashed line of the selection border. Here, the dashed line is a numerical value, different from the canvas dashed line setting. It is implemented internally as [0, strokeDash]. Setting it to 8 will look more aesthetically pleasing.
    fill: string; // The fill color inside the selection. It needs to have a level of transparency, otherwise content in the covered area of the selection will be obscured.
    widgets: ISelectionWidgetConfig; // The eight touch points of the selection. You can refer to Excel's formula and chart selections, which allow you to manually adjust the size of the selection. Univer has four more touch points (up, down, left, and right) than Excel.  https://support.microsoft.com/en-us/office/select-data-for-a-chart-5fca57b7-8c52-4e09-979a-631085113862
    widgetSize?: number; // The volume of the touch points.
    widgetStrokeWidth?: number; // The thickness of the border of the touch points
    widgetStroke?: string; // The color of the touch points.

    // https://support.microsoft.com/en-us/office/copy-a-formula-by-dragging-the-fill-handle-in-excel-for-mac-dd928259-622b-473f-9a33-83aa1a63e218
    hasAutoFill: boolean; // Whether to show the drop-down fill button at the bottom right corner of the selection.
    AutofillSize?: number; // The size of the fill button.
    AutofillStrokeWidth?: number; // The border size of the fill button.
    AutofillStroke?: string; // The color of the fill button.

    hasRowHeader?: boolean; // Whether to synchronize the display of row title highlights, the highlighting range is consistent with the horizontal range of the selection.
    rowHeaderFill?: string; // The color of the row title highlight. A level of transparency should be set to avoid covering the row title content.
    rowHeaderStroke?: string; // The color of the bottom border of the row title.
    rowHeaderStrokeWidth?: number; // The color of the bottom border of the row title.

    hasColumnHeader?: boolean; // The setting of column title highlight is similar to that of row title.
    columnHeaderFill?: string;
    columnHeaderStroke?: string;
    columnHeaderStrokeWidth?: number;
}

export interface ISelectionWithCoordAndStyle extends ISelectionWithCoord {
    style: Nullable<ISelectionStyle>;
}

export interface ISelectionWithStyle extends ISelection {
    style: Nullable<ISelectionStyle>;
}

// The default configuration of the selection.
export function getNormalSelectionStyle(themeService: ThemeService): ISelectionStyle {
    const style = themeService.getCurrentTheme();
    const fill = new TinyColor(style.colorBlack).setAlpha(0.1).toString();
    return {
        strokeWidth: 2,
        stroke: style.primaryColor,
        // strokeDash: 8,
        fill,
        // widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
        widgets: {},
        widgetSize: 6,
        widgetStrokeWidth: 1,
        widgetStroke: style.colorWhite,

        hasAutoFill: true,
        AutofillSize: 6,
        AutofillStrokeWidth: 1,
        AutofillStroke: style.colorWhite,

        hasRowHeader: true,
        rowHeaderFill: fill,
        rowHeaderStroke: style.primaryColor,
        rowHeaderStrokeWidth: 1,

        hasColumnHeader: true,
        columnHeaderFill: fill,
        columnHeaderStroke: style.primaryColor,
        columnHeaderStrokeWidth: 1,
    };
}

/**
 * Process a selection with coordinates and style,
 * and extract the coordinate information, because the render needs coordinates when drawing.
 * Since the selection.manager.service is unrelated to the coordinates,
 * it only accepts data of type ISelectionWithStyle, so a conversion is necessary.
 * @param selectionWithCoordAndStyle Selection with coordinates and style
 * @returns
 */
export function convertSelectionDataToRange(
    selectionWithCoordAndStyle: ISelectionWithCoordAndStyle
): ISelectionWithStyle {
    const { rangeWithCoord, primaryWithCoord, style } = selectionWithCoordAndStyle;
    const result: ISelectionWithStyle = {
        range: {
            startRow: rangeWithCoord.startRow,
            startColumn: rangeWithCoord.startColumn,
            endRow: rangeWithCoord.endRow,
            endColumn: rangeWithCoord.endColumn,
            rangeType: rangeWithCoord.rangeType,
        },
        primary: null,
        style,
    };
    if (primaryWithCoord != null) {
        const { actualRow, actualColumn, isMerged, isMergedMainCell } = primaryWithCoord;
        const { startRow, startColumn, endRow, endColumn } = primaryWithCoord.mergeInfo;
        result.primary = {
            actualRow,
            actualColumn,
            isMerged,
            isMergedMainCell,
            startRow,
            startColumn,
            endRow,
            endColumn,
        };
    }
    return result;
}

/**
 * Convert the coordinates of a single cell into a selection data.
 * @param row Specified Row Coordinate
 * @param column Specified Column Coordinate
 * @param mergeData  Obtain the data of merged cells through the worksheet object.
 * @returns ISelectionWithStyle
 */
export function transformCellDataToSelectionData(
    row: number,
    column: number,
    mergeData: IRange[]
): Nullable<ISelectionWithStyle> {
    const newCellRange = getCellInfoInMergeData(row, column, mergeData);

    const newSelectionData = makeCellRangeToRangeData(newCellRange);

    if (!newSelectionData) {
        return;
    }

    return {
        range: newSelectionData,
        primary: newCellRange,
        style: null,
    };
}
