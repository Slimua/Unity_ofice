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

export default {
    spreadsheetLabel: 'Spreadsheet',
    spreadsheetRightLabel: 'more Sheets',

    toolbar: {
        undo: 'Undo',
        redo: 'Redo',
        formatPainter: 'Paint format',
        currencyFormat: 'Format as currency',
        percentageFormat: 'Format as percent',
        numberDecrease: 'Decrease decimal places',
        numberIncrease: 'Increase decimal places',
        moreFormats: 'More formats',
        font: 'Font',
        fontSize: 'Font size',
        bold: 'Bold',
        italic: 'Italic',
        strikethrough: 'Strikethrough',
        subscript: 'Subscript',
        superscript: 'Superscript',
        underline: 'Underline',
        textColor: {
            main: 'Text color',
            right: 'Choose color',
        },
        resetColor: 'Reset',
        customColor: 'CUSTOM',
        alternatingColors: 'Alternating colors',
        confirmColor: 'OK',
        cancelColor: 'Cancel',
        collapse: 'Collapse',
        fillColor: {
            main: 'Fill color',
            right: 'Choose color',
        },
        border: {
            main: 'Border',
            right: 'Border style',
        },
        mergeCell: {
            main: 'Merge cells',
            right: 'Choose merge type',
        },
        horizontalAlignMode: {
            main: 'Horizontal align',
            right: 'Alignment',
        },
        verticalAlignMode: {
            main: 'Vertical align',
            right: 'Alignment',
        },
        textWrapMode: {
            main: 'Text wrap',
            right: 'Text wrap mode',
        },
        textRotateMode: {
            main: 'Text rotate',
            right: 'Text rotate mode',
        },
        freezeTopRow: 'Freeze top row',
        sortAndFilter: 'Sort and filter',
        findAndReplace: 'Find and replace',
        sum: 'SUM',
        autoSum: 'Auto SUM',
        moreFunction: 'More functions',
        conditionalFormat: 'Conditional format',
        comment: 'Comment',
        pivotTable: 'Pivot Table',
        chart: 'Chart',
        screenshot: 'Screenshot',
        splitColumn: 'Split text',
        insertImage: 'Insert image',
        insertLink: 'Insert link',
        dataValidation: 'Data validation',
        protection: 'Protect the sheet',

        clearText: 'Clear color',
        noColorSelectedText: 'No color is selected',

        toolMore: 'More',
        toolLess: 'Less',
        toolClose: 'Close',
        toolMoreTip: 'More features',
        moreOptions: 'More options',

        cellFormat: 'Cell format config',
        print: 'Print',
        borderMethod: {
            top: 'Upper frame line',
            bottom: 'Lower frame line',
            left: 'Left frame line',
            right: 'Right frame line',
        },
        more: 'More',
    },
    defaultFmt: {
        Automatic: {
            text: 'Automatic',
            value: 'General',
            example: '',
        },
        Number: {
            text: 'Number',
            value: '##0.00',
            example: '1000.12',
        },
        Percent: {
            text: 'Percent',
            value: '#0.00%',
            example: '12.21%',
        },
        PlainText: {
            text: 'Plain text',
            value: '@',
            example: '',
        },
        Scientific: {
            text: 'Scientific',
            value: '0.00E+00',
            example: '1.01E+5',
        },
        Accounting: {
            text: 'Accounting',
            value: '¥(0.00)',
            example: '¥(1200.09)',
        },
        Thousand: {
            text: 'Ten Thousand',
            value: 'w',
            example: '1亿2000万2500',
        },
        Currency: {
            text: 'Currency',
            value: '¥0.00',
            example: '¥1200.09',
        },
        Digit: {
            text: '万元2位小数',
            value: 'w0.00',
            example: '2万2500.55',
        },
        Date: {
            text: 'Date',
            value: 'yyyy-MM-dd',
            example: '2017-11-29',
        },
        Time: { text: 'Time', value: 'hh:mm AM/PM', example: '3:00 PM' },
        Time24H: { text: 'Time 24H', value: 'hh:mm', example: '15:00' },
        DateTime: { text: 'Date time', value: 'yyyy-MM-dd hh:mm AM/PM', example: '2017-11-29 3:00 PM' },
        DateTime24H: { text: 'Date time 24H', value: 'yyyy-MM-dd hh:mm', example: '2017-11-29 15:00' },
        CustomFormats: { text: 'Custom Formats', value: 'fmtOtherSelf', example: '' },
    },
    format: {
        moreCurrency: 'More currency formats',
        moreDateTime: 'More date and time formats',
        moreNumber: 'More number formats',

        titleCurrency: 'Currency formats',
        decimalPlaces: 'Decimal places',
        titleDateTime: 'Date and time formats',
        titleNumber: 'Number formats',
    },
    print: {
        normalBtn: 'Normal',
        layoutBtn: 'Page Layout',
        pageBtn: 'Page break preview',

        menuItemPrint: 'Print (Ctrl+P)',
        menuItemAreas: 'Print areas',
        menuItemRows: 'Print title rows',
        menuItemColumns: 'Print title columns',
    },
    align: {
        left: 'left',
        center: 'center',
        right: 'right',

        top: 'top',
        middle: 'middle',
        bottom: 'bottom',
    },

    dateFmtList: [
        {
            name: '1930-08-05',
            value: 'yyyy-MM-dd',
        },
        {
            name: '1930/8/5',
            value: 'yyyy/MM/dd',
        },
        {
            name: '08-05',
            value: 'MM-dd',
        },
        {
            name: '8-5',
            value: 'M-d',
        },
        {
            name: '13:30:30',
            value: 'h:mm:ss',
        },
        {
            name: '13:30',
            value: 'h:mm',
        },
        {
            name: 'PM 01:30',
            value: 'AM/PM hh:mm',
        },
        {
            name: 'PM 1:30',
            value: 'AM/PM h:mm',
        },
        {
            name: 'PM 1:30:30',
            value: 'AM/PM h:mm:ss',
        },
        {
            name: '08-05 PM 01:30',
            value: 'MM-dd AM/PM hh:mm',
        },
    ],
    numFmtList: [
        {
            name: '1235',
            value: '0',
        },
        {
            name: '1234.56',
            value: '0.00',
        },
        {
            name: '1,235',
            value: '#,##0',
        },
        {
            name: '1,234.56',
            value: '#,##0.00',
        },
        {
            name: '1,235',
            value: '#,##0_);(#,##0)',
        },
        {
            name: '1,235',
            value: '#,##0_);[Red](#,##0)',
        },
        {
            name: '1,234.56',
            value: '#,##0.00_);(#,##0.00)',
        },
        {
            name: '1,234.56',
            value: '#,##0.00_);[Red](#,##0.00)',
        },
        {
            name: '$1,235',
            value: '$#,##0_);($#,##0)',
        },
        {
            name: '$1,235',
            value: '$#,##0_);[Red]($#,##0)',
        },
        {
            name: '$1,234.56',
            value: '$#,##0.00_);($#,##0.00)',
        },
        {
            name: '$1,234.56',
            value: '$#,##0.00_);[Red]($#,##0.00)',
        },
        {
            name: '1234.56',
            value: '@',
        },
        {
            name: '123456%',
            value: '0%',
        },
        {
            name: '123456.00%',
            value: '0.00%',
        },
        {
            name: '1.23E+03',
            value: '0.00E+00',
        },
        {
            name: '1.2E+3',
            value: '##0.0E+0',
        },
        {
            name: '1234 5/9',
            value: '# ?/?',
        },
        {
            name: '1234 14/25',
            value: '# ??/??',
        },
        {
            name: '$ 1,235',
            value: '_($* #,##0_);_(...($* "-"_);_(@_)',
        },
        {
            name: '1,235',
            value: '_(* #,##0_);_(*..._(* "-"_);_(@_)',
        },
        {
            name: '$ 1,234.56',
            // "value": '_($* #,##0.00_)...* "-"??_);_(@_)'
            value: '_($* #,##0.00_);_(...($* "-"_);_(@_)',
        },
        {
            name: '1,234.56',
            value: '_(* #,##0.00_);...* "-"??_);_(@_)',
        },
    ],
    button: {
        confirm: 'OK',
        cancel: 'Cancel',
        close: 'Close',
        update: 'Update',
        delete: 'Delete',
        insert: 'Insert',
        prevPage: 'Previous',
        nextPage: 'Next',
        total: 'total:',
    },
    punctuation: {
        tab: 'Tab',
        semicolon: 'semicolond',
        comma: 'comma',
        space: 'space',
    },
    colorPicker: {
        collapse: 'Collapse',
        customColor: 'CUSTOM',
        change: 'Change',
        confirmColor: 'OK',
        cancelColor: 'Cancel',
    },
    borderLine: {
        borderTop: 'borderTop',
        borderBottom: 'borderBottom',
        borderLeft: 'borderLeft',
        borderRight: 'borderRight',
        borderNone: 'borderNone',
        borderAll: 'borderAll',
        borderOutside: 'borderOutside',
        borderInside: 'borderInside',
        borderHorizontal: 'borderHorizontal',
        borderVertical: 'borderVertical',
        borderColor: 'borderColor',
        borderSize: 'borderSize',
        borderType: 'borderType',
    },
    merge: {
        all: 'Merge all',
        vertical: 'Vertical merge',
        horizontal: 'Horizontal merge',
        cancel: 'Cancel merge',
        overlappingError: 'Cannot merge overlapping areas',
        partiallyError: 'Cannot perform this operation on partially merged cells',
        confirm: {
            title: 'Continue merging would only keep the upper-left cell value, discard other values. Are you sure to continue?',
            cancel: 'Cancel merging',
            confirm: 'Continue merging',
            waring: 'Waring',
            dismantleMergeCellWaring: 'This will cause some merged cells to be split. Do you want to continue?',
        },
    },
    textWrap: {
        overflow: 'Overflow',
        wrap: 'Wrap',
        clip: 'Clip',
    },
    textRotate: {
        none: 'None',
        angleUp: 'Tilt Up',
        angleDown: 'Tilt Down',
        vertical: 'Stack Vertically',
        rotationUp: 'Rotate Up',
        rotationDown: 'Rotate Down',
    },
    sheetConfig: {
        delete: 'Delete',
        copy: 'Copy',
        rename: 'Rename',
        changeColor: 'Change color',
        hide: 'Hide',
        unhide: 'Unhide',
        moveLeft: 'Move left',
        moveRight: 'Move right',
        resetColor: 'Reset color',
        cancelText: 'Cancel',
        chooseText: 'Confirm color',

        tipNameRepeat: 'The name of the tab page cannot be repeated! Please revise',
        noMoreSheet:
            'The workbook contains at least one visual worksheet. To delete the selected worksheet, please insert a new worksheet or show a hidden worksheet.',
        confirmDelete: 'Are you sure to delete',
        redoDelete: 'Can be undo by Ctrl+Z',
        noHide: "Can't hide, at least keep one sheet tag",
        chartEditNoOpt: 'This operation is not allowed in chart editing mode!',
        sheetNameErrorTitle: 'There was a problem',
        sheetNameSpecCharError: 'The name cannot contain:[ ] :  ? * / \' "',
        sheetNameCannotIsEmptyError: 'The sheet name cannot be empty.',
        sheetNameAlreadyExistsError: 'The sheet name already exists. Please enter another name.',
        deleteSheet: 'Delete worksheet',
        deleteSheetContent:
            'Confirm to delete this worksheet. It will not be retrieved after deletion. Are you sure you want to delete it?',
    },
    rightClick: {
        copy: 'Copy',
        copyAs: 'Copy as',
        cut: 'Cut',
        paste: 'Paste',
        pasteSpecial: 'Paste Special',
        pasteValue: 'Paste Value',
        pasteFormat: 'Paste Format',
        pasteColWidth: 'Paste Column Width',
        pasteBesidesBorder: 'Paste Besides Border Styles',
        insert: 'Insert',
        insertRow: 'Insert Row',
        insertRowBefore: 'Insert Row Before',
        insertColumn: 'Insert Column',
        insertColumnBefore: 'Insert Column Before',
        delete: 'Delete',
        deleteCell: 'Delete Cell',
        insertCell: 'Insert Cell',
        deleteSelected: 'Delete Selected ',
        hide: 'Hide',
        hideSelected: 'Hide Selected ',
        showHide: 'Show Hidden',
        toTopAdd: 'Towards Top Add',
        toBottomAdd: 'Towards Bottom Add',
        toLeftAdd: 'Towards Left Add',
        toRightAdd: 'Towards Right Add',
        deleteSelectedRow: 'Delete Selected row',
        deleteSelectedColumn: 'Delete Selected column',
        hideSelectedRow: 'Hide Selected Row',
        showHideRow: 'Show Selected Row',
        rowHeight: 'Row Height',
        hideSelectedColumn: 'Hide Selected Column',
        showHideColumn: 'Show Hide Column',
        columnWidth: 'Column Width',
        to: 'Towards',
        left: 'Left',
        right: 'Right',
        top: 'Top',
        bottom: 'Bottom',
        moveLeft: 'Move Left',
        moveUp: 'Move up',
        moveRight: 'Move Right',
        moveDown: 'Move Down',
        add: 'Add',
        row: 'Row',
        column: 'Column',
        width: 'Width',
        height: 'Height',
        number: 'Number',
        confirm: 'Confirm',
        orderAZ: 'A-Z order',
        orderZA: 'Z-A order',
        clearSelection: 'Clear',
        clearContent: 'Clear Contents',
        clearFormat: 'Clear Formats',
        clearAll: 'Clear All',
        matrix: 'Matrix operation',
        sortSelection: 'Sort',
        filterSelection: 'Filter',
        chartGeneration: 'Create Chart',
        firstLineTitle: 'First Line Title',
        untitled: 'Untitled',
        array1: 'One-dimensional array',
        array2: 'Two-dimensional array',
        array3: 'Multidimensional Arrays',
        diagonal: 'Diagonal',
        antiDiagonal: 'Anti-diagonal',
        diagonalOffset: 'Diagonal offset',
        offset: 'Offset',
        boolean: 'Boolean',
        flip: 'Flip',
        upAndDown: 'Up and down',
        leftAndRight: 'Left and right',
        clockwise: 'Clockwise',
        counterclockwise: 'Counterclockwise',
        transpose: 'Transpose',
        matrixCalculation: 'Matrix Calculation',
        plus: 'Plus',
        minus: 'Minus',
        multiply: 'Multiply',
        divided: 'Divided',
        power: 'Power',
        root: 'Root',
        log: 'Log',
        delete0: 'Delete 0 values at both ends',
        removeDuplicate: 'Remove duplicate values',
        byRow: 'By row',
        byCol: 'By column',
        generateNewMatrix: 'Generate new matrix',
        fitContent: 'Fit for data',
        freeze: 'Freeze',
        freezeCol: 'Freeze to this column',
        freezeRow: 'Freeze to this row',
        cancelFreeze: 'Cancel freeze',
        zenEditor: 'Full Screen Editor',
        deleteAllRowsAlert: 'You can\'t delete all the rows on the sheet',
        deleteAllColumnsAlert: 'You can\'t delete all the columns on the sheet',
        hideAllRowsAlert: 'You can\'t hide all the rows on the sheet',
        hideAllColumnsAlert: 'You can\'t hide all the columns on the sheet',
    },
    info: {
        tooltip: 'Tooltip',
        notChangeMerge: 'You cannot make partial changes to the merged cells',
        detailUpdate: 'New opened',
        detailSave: 'Local cache restored',
        row: '',
        column: '',
        loading: 'Loading...',

        copy: 'Copy',
        return: 'Exit',
        rename: 'Rename',
        tips: 'Rename',
        noName: 'Untitled spreadsheet',
        wait: 'waiting for update',

        add: 'Add',
        addLast: 'more rows at bottom',
        backTop: 'Back to the top',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfo: 'Total ${total}，${totalPage} page，current ${currentPage}',
        nextPage: 'Next',

        tipInputNumber: 'Please enter the number',
        tipInputNumberLimit: 'The increase range is limited to 1-100',

        tipRowHeightLimit: 'Row height must be between 0 ~ 545',
        tipColumnWidthLimit: 'The column width must be between 0 ~ 2038',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfoFull: 'Total ${total}，${totalPage} page，All data displayed',
        problem: 'There was a problem',
    },
    clipboard: {
        paste: {
            exceedMaxCells: 'The number of cells pasted exceeds the maximum number of cells',
        },
    },
    statusbar: {
        sum: 'Sum',
        average: 'Average',
        min: 'Min',
        max: 'Max',
        count: 'Numerical Count',
        countA: 'Count',
        clickToCopy: 'Click to Copy',
        copied: 'Copied',
    },
    autoFill: {
        copy: 'Copy Cell',
        series: 'Fill Series',
        formatOnly: 'Format Only',
        noFormat: 'No Format',
    },

    rangeSelector: {
        placeholder: 'Select range or input value',
        tooltip: 'Select range',
    },

    shortcut: {
        sheet: {
            'zoom-in': 'Zoom in',
            'zoom-out': 'Zoom out',
            'reset-zoom': 'Reset zoom level',
            'select-below-cell': 'Select the cell below',
            'select-up-cell': 'Select the cell above',
            'select-left-cell': 'Select the left cell',
            'select-right-cell': 'Select the right cell',
            'select-next-cell': 'Select the next cell',
            'select-previous-cell': 'Select the previous cell',
            'select-up-value-cell': 'Select the cell above that has value',
            'select-below-value-cell': 'Select the cell below that has value',
            'select-left-value-cell': 'Select the cell left that has value',
            'select-right-value-cell': 'Select the cell right that has value',
            'expand-selection-down': 'Expand selection down',
            'expand-selection-up': 'Expand selection up',
            'expand-selection-left': 'Expand selection left',
            'expand-selection-right': 'Expand selection right',
            'expand-selection-to-left-gap': 'Expand selection to the left gap',
            'expand-selection-to-below-gap': 'Expand selection to the below gap',
            'expand-selection-to-right-gap': 'Expand selection to the right gap',
            'expand-selection-to-up-gap': 'Expand selection to the up gap',
            'select-all': 'Select all',
            'toggle-editing': 'Toggle editing',
            'delete-and-start-editing': 'Clear and start editing',
            'abort-editing': 'Abort editing',
            'break-line': 'Break line',
            'set-bold': 'Toggle bold',
            'set-italic': 'Toggle italic',
            'set-underline': 'Toggle underline',
            'set-strike-through': 'Toggle strike through',
        },
    },

    'sheet-view': 'Sheet View',
    'sheet-edit': 'Sheet Edit',
};
