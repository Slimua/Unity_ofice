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
    spreadsheetLabel: '插件',
    spreadsheetRightLabel: '更多 Sheets',

    // toolbar.undo
    toolbar: {
        undo: '撤销',
        redo: '重做',
        formatPainter: '格式刷',
        currencyFormat: '货币格式',
        percentageFormat: '百分比格式',
        numberDecrease: '减少小数位数',
        numberIncrease: '增加小数位数',
        moreFormats: '更多格式',
        font: '字体',
        fontSize: '字号',
        bold: '粗体',
        italic: '斜体',
        strikethrough: '删除线',
        subscript: '下标',
        superscript: '上标',
        underline: '下划线',
        textColor: {
            main: '文本颜色',
            right: '颜色选择',
        },
        resetColor: '重置颜色',
        customColor: '自定义',
        alternatingColors: '交替颜色',
        confirmColor: '确定颜色',
        cancelColor: '取消',
        collapse: '收起',
        fillColor: {
            main: '单元格颜色',
            right: '颜色选择',
        },
        border: {
            main: '边框',
            right: '边框类型',
        },
        mergeCell: {
            main: '合并单元格',
            right: '选择合并类型',
        },
        horizontalAlignMode: {
            main: '水平对齐',
            right: '对齐方式',
        },
        verticalAlignMode: {
            main: '垂直对齐',
            right: '对齐方式',
        },
        textWrapMode: {
            main: '文本换行',
            right: '换行方式',
        },
        textRotateMode: {
            main: '文本旋转',
            right: '旋转方式',
        },
        freezeTopRow: '冻结首行',
        sortAndFilter: '排序和筛选',
        findAndReplace: '查找替换',
        sum: '求和',
        autoSum: '自动求和',
        moreFunction: '更多函数',
        conditionalalFormat: '条件格式',
        comment: '批注',
        pivotTable: '数据透视表',
        chart: '图表',
        screenshot: '截图',
        splitColumn: '分列',
        insertImage: '插入图片',
        insertLink: '插入链接',
        dataValidation: '数据验证',
        protection: '保护工作表内容',

        clearText: '清除颜色选择',
        noColorSelectedText: '没有颜色被选择',

        toolMore: '更多',
        toolLess: '少于',
        toolClose: '收起',
        toolMoreTip: '更多功能',
        moreOptions: '更多选项',

        cellFormat: '设置单元格格式',
        print: '打印',
        borderMethod: {
            top: '上框线',
            bottom: '下框线',
            left: '左框线',
            right: '右框线',
        },
        more: '更多',
    },
    defaultFmt: {
        Automatic: {
            text: '自动',
            value: 'General',
            example: '',
        },
        Number: {
            text: '数字',
            value: '##0.00',
            example: '1000.12',
        },
        Percent: {
            text: '百分比',
            value: '#0.00%',
            example: '12.21%',
        },
        PlainText: {
            text: '纯文本',
            value: '@',
            example: '',
        },
        Scientific: {
            text: '科学计数',
            value: '0.00E+00',
            example: '1.01E+5',
        },
        Accounting: {
            text: '会计',
            value: '¥(0.00)',
            example: '¥(1200.09)',
        },
        Thousand: {
            text: '万元',
            value: 'w',
            example: '1亿2000万2500',
        },
        Currency: {
            text: '货币',
            value: '¥0.00',
            example: '¥1200.09',
        },
        Digit: {
            text: '万元2位小数',
            value: 'w0.00',
            example: '2万2500.55',
        },
        Date: {
            text: '日期',
            value: 'yyyy-MM-dd',
            example: '2017-11-29',
        },
        Time: { text: '时间', value: 'hh:mm AM/PM', example: '3:00 PM' },
        Time24H: { text: '时间24H', value: 'hh:mm', example: '15:00' },
        DateTime: { text: '日期时间', value: 'yyyy-MM-dd hh:mm AM/PM', example: '2017-11-29 3:00 PM' },
        DateTime24H: { text: '日期时间24H', value: 'yyyy-MM-dd hh:mm', example: '2017-11-29 15:00' },
        CustomFormats: { text: '自定义格式', value: 'fmtOtherSelf', example: '' },
    },
    format: {
        moreCurrency: '更多货币格式',
        moreDateTime: '更多日期与时间格式',
        moreNumber: '更多数字格式',

        titleCurrency: '货币格式',
        decimalPlaces: '小数位数',
        titleDateTime: '日期与时间格式',
        titleNumber: '数字格式',
    },
    print: {
        normalBtn: '常规视图',
        layoutBtn: '页面布局',
        pageBtn: '分页预览',

        menuItemPrint: '打印(Ctrl+P)',
        menuItemAreas: '打印区域',
        menuItemRows: '打印标题行',
        menuItemColumns: '打印标题列',
    },
    align: {
        left: '左对齐',
        center: '中间对齐',
        right: '右对齐',

        top: '顶部对齐',
        middle: '居中对齐',
        bottom: '底部对齐',
    },

    button: {
        confirm: '确定',
        cancel: '取消',
        close: '关闭',
        update: 'Update',
        delete: 'Delete',
        insert: '新建',
        prevPage: '上一页',
        nextPage: '下一页',
        total: '总共：',
    },
    punctuation: {
        tab: 'Tab 键',
        semicolon: '分号',
        comma: '逗号',
        space: '空格',
    },
    colorPicker: {
        collapse: '收起',
        customColor: '自定义',
        change: '切换',
        confirmColor: '确定',
        cancelColor: '取消',
    },
    borderLine: {
        borderTop: '上框线',
        borderBottom: '下框线',
        borderLeft: '左框线',
        borderRight: '右框线',
        borderNone: '无',
        borderAll: '所有',
        borderOutside: '外侧',
        borderInside: '内侧',
        borderHorizontal: '内侧横线',
        borderVertical: '内侧竖线',
        borderColor: '边框颜色',
        borderSize: '边框粗细',
        borderType: '边框线类型',
    },
    merge: {
        all: '全部合并',
        vertical: '垂直合并',
        horizontal: '水平合并',
        cancel: '取消合并',
        overlappingError: '不能合并重叠区域',
        partiallyError: '无法对部分合并单元格执行此操作',
        confirm: {
            title: '合并单元格仅保存左上角单元格的值，是否继续？',
            cancel: '取消合并',
            confirm: '继续合并',
            waring: '警告',
            dismantleMergeCellWaring: '此操作会导致一些合并单元格被拆散，是否继续?',
        },
    },
    textWrap: {
        overflow: '溢出',
        wrap: '自动换行',
        clip: '截断',
    },
    textRotate: {
        none: '无旋转',
        angleUp: '向上倾斜',
        angleDown: '向下倾斜',
        vertical: '竖排文字',
        rotationUp: '向上90°',
        rotationDown: '向下90°',
    },
    sheetConfig: {
        delete: '删除',
        copy: '复制',
        rename: '重命名',
        changeColor: '更改颜色',
        hide: '隐藏',
        unhide: '取消隐藏',
        moveLeft: '向左移',
        moveRight: '向右移',
        resetColor: '重置颜色',
        cancelText: '取消',
        chooseText: '确定颜色',

        tipNameRepeat: '标签页的名称不能重复！请重新修改',
        noMoreSheet:
            '工作薄内至少含有一张可视工作表。若需删除选定的工作表，请先插入一张新工作表或显示一张隐藏的工作表。',
        confirmDelete: '是否删除',
        redoDelete: '可以通过Ctrl+Z撤销删除',
        noHide: '不能隐藏, 至少保留一个sheet标签',
        chartEditNoOpt: '图表编辑模式下不允许该操作！',
        sheetNameErrorTitle: '错误',
        sheetNameSpecCharError: "名称不能超过31个字符，首尾不能是' 且名称不能包含:\r\n[ ] : \\ ? * /",
        sheetNameCannotIsEmptyError: '名称不能为空。',
        sheetNameAlreadyExistsError: '工作表已存在，请输入其它名称。',
        deleteSheet: '删除工作表',
        deleteSheetContent: '确认删除此工作表，删除后将不可找回，确定要删除吗？',
    },
    rightClick: {
        copy: '复制',
        copyAs: '复制为',
        cut: '剪切',
        paste: '粘贴',
        pasteSpecial: '选择性粘贴',
        pasteValue: '仅粘贴值',
        pasteFormat: '仅粘贴格式',
        pasteColWidth: '仅粘贴列宽',
        pasteBesidesBorder: '仅粘贴边框以外内容',
        insert: '插入',
        delete: '删除',
        insertRow: '插入行',
        insertRowBefore: '在上方插入行',
        insertColumn: '插入列',
        insertColumnBefore: '在左侧插入列',
        deleteCell: '删除单元格',
        insertCell: '插入单元格',
        deleteSelected: '删除选中',
        hide: '隐藏',
        hideSelected: '隐藏选中',
        showHide: '显示隐藏',
        toTopAdd: '向上增加',
        toBottomAdd: '向下增加',
        toLeftAdd: '向左增加',
        toRightAdd: '向右增加',
        deleteSelectedRow: '删除选中行',
        deleteSelectedColumn: '删除选中列',
        hideSelectedRow: '隐藏选中行',
        showHideRow: '显示隐藏行',
        rowHeight: '行高',
        hideSelectedColumn: '隐藏选中列',
        showHideColumn: '显示隐藏列',
        columnWidth: '列宽',
        to: '向',
        left: '左',
        right: '右',
        top: '上',
        bottom: '下',
        moveLeft: '左移',
        moveUp: '上移',
        moveRight: '右移',
        moveDown: '下移',
        add: '增加',
        row: '行',
        column: '列',
        width: '宽',
        height: '高',
        number: '数字',
        confirm: '确认',
        orderAZ: 'A-Z顺序排列',
        orderZA: 'Z-A降序排列',
        clearSelection: '清除',
        clearContent: '清除内容',
        clearFormat: '清除格式',
        clearAll: '清除全部',
        matrix: '矩阵操作选区',
        sortSelection: '排序选区',
        filterSelection: '筛选选区',
        chartGeneration: '图表生成',
        firstLineTitle: '首行为标题',
        untitled: '无标题',
        array1: '一维数组',
        array2: '二维数组',
        array3: '多维数组',
        diagonal: '对角线',
        antiDiagonal: '反对角线',
        diagonalOffset: '对角偏移',
        offset: '偏移量',
        boolean: '布尔值',
        flip: '翻转',
        upAndDown: '上下',
        leftAndRight: '左右',
        clockwise: '顺时针',
        counterclockwise: '逆时针',
        transpose: '转置',
        matrixCalculation: '矩阵计算',
        plus: '加',
        minus: '减',
        multiply: '乘',
        divided: '除',
        power: '次方',
        root: '次方根',
        log: 'log',
        delete0: '删除两端0值',
        removeDuplicate: '删除重复值',
        byRow: '按行',
        byCol: '按列',
        generateNewMatrix: '生成新矩阵',
        fitContent: '适合数据',
        freeze: '冻结',
        freezeCol: '冻结列',
        freezeRow: '冻结行',
        cancelFreeze: '取消冻结',
        zenEditor: '禅模式编辑',
        deleteAllRowsAlert: '您无法删除工作表上的所有行',
        deleteAllColumnsAlert: '您无法删除工作表上的所有列',
        hideAllRowsAlert: '您无法隐藏工作表上的所有行',
        hideAllColumnsAlert: '您无法隐藏工作表上的所有列',
    },
    info: {
        tooltip: '提示',
        notChangeMerge: '不能对合并单元格做部分更改',
        detailUpdate: '新打开',
        detailSave: '已恢复本地缓存',
        row: '行',
        column: '列',
        loading: '渲染中···',

        copy: '副本',
        return: '返回',
        rename: '重命名',
        tips: '重命名',
        noName: '无标题的电子表格',
        wait: '待更新',

        add: '添加',
        addLast: '在底部添加',
        backTop: '回到顶部',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfo: '共${total}条，${totalPage}页，当前已显示${currentPage}页',
        nextPage: '下一页',

        tipInputNumber: '请输入数字',
        tipInputNumberLimit: '增加范围限制在1-100',

        tipRowHeightLimit: '行高必须在0 ~ 545之间',
        tipColumnWidthLimit: '列宽必须在0 ~ 2038之间',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfoFull: '共${total}条，${totalPage}页，已显示全部数据',
        problem: '出现了一个问题',
    },
    clipboard: {
        paste: {
            exceedMaxCells: '粘贴区域超出最大单元格数',
        },
    },
    statusbar: {
        sum: '求和',
        average: '平均值',
        min: '最小值',
        max: '最大值',
        count: '数值计数',
        countA: '计数',
        clickToCopy: '点击复制数值',
        copied: '已复制',
    },
    autoFill: {
        copy: '复制单元格',
        series: '填充序列',
        formatOnly: '仅填充格式',
        noFormat: '不带格式填充',
    },
    rangeSelector: {
        placeholder: '选择范围或输入值',
        tooltip: '选择范围',
    },
    shortcut: {
        sheet: {
            'zoom-in': '放大',
            'zoom-out': '缩小',
            'reset-zoom': '恢复缩放',
            'select-below-cell': '选择下方单元格',
            'select-up-cell': '选择上方单元格',
            'select-left-cell': '选择左侧单元格',
            'select-right-cell': '选择右侧单元格',
            'select-next-cell': '选择后一个单元格',
            'select-previous-cell': '选择前一个单元格',
            'select-up-value-cell': '选择上方有值的单元格',
            'select-below-value-cell': '选择下方有值的单元格',
            'select-left-value-cell': '选择左侧有值的单元格',
            'select-right-value-cell': '选择右侧有值的单元格',
            'expand-selection-down': '向下扩展选区',
            'expand-selection-up': '向上扩展选区',
            'expand-selection-left': '向左扩展选区',
            'expand-selection-right': '向右扩展选区',
            'expand-selection-to-left-gap': '向左扩展选区到下一个边界',
            'expand-selection-to-below-gap': '向下扩展选区到下一个边界',
            'expand-selection-to-right-gap': '向右扩展选区到下一个边界',
            'expand-selection-to-up-gap': '向上扩展选区到下一个边界',
            'select-all': '全选',
            'toggle-editing': '开始 / 结束编辑',
            'delete-and-start-editing': '清空并开始编辑',
            'abort-editing': '放弃编辑',
            'break-line': '换行',
            'set-bold': '切换粗体',
            'set-italic': '切换斜体',
            'set-underline': '切换下划线',
            'set-strike-through': '切换删除线',
        },
    },
    'sheet-view': '浏览表格',
    'sheet-edit': '编辑表格',
};
