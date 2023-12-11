/**
 * Copyright 2023 DreamNum Inc.
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

/**
 * Name set of all action
 */
export enum ACTION_NAMES {
    /** @see src/Command/Action/InsertDataRowAction */
    INSERT_ROW_DATA_ACTION = 'InsertRowDataAction',
    REMOVE_ROW_DATA_ACTION = 'RemoveRowDataAction',
    INSERT_ROW_ACTION = 'InsertRowAction',
    REMOVE_ROW_ACTION = 'RemoveRowAction',
    SET_RANGE_STYLE_ACTION = 'SetRangeStyleAction',
    SET_SELECTION_ACTION = 'SetSelectionActivateAction',
    SET_RANGE_DATA_ACTION = 'SetRangeDataAction',
    SET_RANGE_FORMATTED_VALUE_ACTION = 'SetRangeFormattedValueAction',
    SET_RANGE_NOTE_ACTION = 'SetRangeNoteAction',
    DELETE_RANGE_ACTION = 'DeleteRangeAction',
    INSERT_SHEET_ACTION = 'InsertSheetAction',
    REMOVE_SHEET_ACTION = 'RemoveSheetAction',
    CLEAR_RANGE_ACTION = 'ClearRangeAction',
    INSERT_RANGE_ACTION = 'InsertRangeAction',
    SET_TAB_COLOR_ACTION = 'SetTabColorAction',
    HIDE_SHEET_ACTION = 'SetWorkSheetHideAction',
    SET_WORKSHEET_ACTIVATE_ACTION = 'SetWorkSheetActivateAction',
    INSERT_COLUMN_ACTION = 'InsertColumnAction',
    INSERT_COLUMN_DATA_ACTION = 'InsertColumnDataAction',
    REMOVE_COLUMN_ACTION = 'RemoveColumnAction',
    REMOVE_COLUMN_DATA_ACTION = 'RemoveColumnDataAction',
    SET_HIDE_ROW_ACTION = 'SetRowHideAction',
    SET_HIDE_COLUMN_ACTION = 'SetColumnHideAction',
    SET_SHOW_ROW_ACTION = 'SetRowShowAction',
    SET_SHOW_COLUMN_ACTION = 'SetColumnShowAction',
    ADD_MERGE_ACTION = 'AddMergeAction',
    REMOVE_MERGE_ACTION = 'RemoveMergeAction',
    SET_WORKSHEET_NAME_ACTION = 'SetWorkSheetNameAction',
    SET_WORKSHEET_STATUS_ACTION = 'SetWorkSheetStatusAction',
    SET_BORDER_ACTION = 'SetBorderAction',
    SET_COLUMN_WIDTH_ACTION = 'SetColumnWidthAction',
    SET_ROW_HEIGHT_ACTION = 'SetRowHeightAction',
    SET_HIDDEN_GRIDLINES_ACTION = 'SetHiddenGridlinesAction',
    SET_RIGHT_TO_LEFT_ACTION = 'SetRightToLeftAction',
    DELETE_BANDING_ACTION = 'DeleteBandingAction',
    SET_BANDING_ACTION = 'SetBandingAction',
    ADD_BANDING_ACTION = 'AddBandingAction',
    DELETE_NAMED_RANGE_ACTION = 'DeleteNamedRangeAction',
    SET_NAMED_RANGE_ACTION = 'SetNamedRangeAction',
    ADD_NAMED_RANGE_ACTION = 'AddNamedRangeAction',
    SET_SHEET_ORDER_ACTION = 'SetSheetOrderAction',
    SET_ZOOM_RATIO_ACTION = 'SetZoomRatioAction',
    SET_FROZEN_COLUMNS_ACTION = 'SetFrozenColumnsAction',
    SET_FROZEN_ROWS_ACTION = 'SetFrozenRowsAction',
}
