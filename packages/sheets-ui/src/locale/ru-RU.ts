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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    spreadsheetLabel: 'Электронная таблица',
    spreadsheetRightLabel: 'больше листов',

    toolbar: {
        undo: 'Отменить',
        redo: 'Повторить',
        formatPainter: 'Копировать формат',
        currencyFormat: 'Форматировать как валюту',
        percentageFormat: 'Форматировать как процент',
        numberDecrease: 'Уменьшить количество десятичных знаков',
        numberIncrease: 'Увеличить количество десятичных знаков',
        moreFormats: 'Больше форматов',
        font: 'Шрифт',
        fontSize: 'Размер шрифта',
        bold: 'Жирный',
        italic: 'Курсив',
        strikethrough: 'Зачеркнутый',
        subscript: 'Нижний индекс',
        superscript: 'Верхний индекс',
        underline: 'Подчеркнутый',
        textColor: {
            main: 'Цвет текста',
            right: 'Выбрать цвет',
        },
        resetColor: 'Сбросить',
        customColor: 'ПОЛЬЗ.',
        alternatingColors: 'Чередующиеся цвета',
        confirmColor: 'ОК',
        cancelColor: 'Отмена',
        collapse: 'Свернуть',
        fillColor: {
            main: 'Цвет заливки',
            right: 'Выбрать цвет',
        },
        border: {
            main: 'Граница',
            right: 'Стиль границы',
        },
        mergeCell: {
            main: 'Объединить ячейки',
            right: 'Выбрать тип объединения',
        },
        horizontalAlignMode: {
            main: 'Горизонтальное выравнивание',
            right: 'Выравнивание',
        },
        verticalAlignMode: {
            main: 'Вертикальное выравнивание',
            right: 'Выравнивание',
        },
        textWrapMode: {
            main: 'Перенос текста',
            right: 'Режим переноса текста',
        },
        textRotateMode: {
            main: 'Поворот текста',
            right: 'Режим поворота текста',
        },
        freezeTopRow: 'Закрепить верхнюю строку',
        sortAndFilter: 'Сортировка и фильтр',
        findAndReplace: 'Найти и заменить',
        sum: 'СУММ',
        autoSum: 'Авто СУММ',
        moreFunction: 'Больше функций',
        conditionalFormatting: 'Условное форматирование',
        comment: 'Комментарий',
        pivotTable: 'Сводная таблица',
        chart: 'Диаграмма',
        screenshot: 'Снимок экрана',
        splitColumn: 'Разделить текст',
        insertImage: 'Вставить изображение',
        insertLink: 'Вставить ссылку',
        dataValidation: 'Проверка данных',
        protection: 'Защита листа',

        clearText: 'Очистить цвет',
        noColorSelectedText: 'Цвет не выбран',

        toolMore: 'Больше',
        toolLess: 'Меньше',
        toolClose: 'Закрыть',
        toolMoreTip: 'Больше возможностей',
        moreOptions: 'Больше опций',

        cellFormat: 'Настройка формата ячейки',
        print: 'Печать',
        borderMethod: {
            top: 'Верхняя рамка',
            bottom: 'Нижняя рамка',
            left: 'Левая рамка',
            right: 'Правая рамка',
        },
        more: 'Больше',
    },
    defaultFmt: {
        Automatic: {
            text: 'Автоматический',
            value: 'Общий',
            example: '',
        },
        Number: {
            text: 'Число',
            value: '##0.00',
            example: '1000.12',
        },
        Percent: {
            text: 'Процент',
            value: '#0.00%',
            example: '12.21%',
        },
        PlainText: {
            text: 'Простой текст',
            value: '@',
            example: '',
        },
        Scientific: {
            text: 'Научный',
            value: '0.00E+00',
            example: '1.01E+5',
        },
        Accounting: {
            text: 'Бухгалтерский учет',
            value: '¥(0.00)',
            example: '¥(1200.09)',
        },
        Thousand: {
            text: 'Десять тысяч',
            value: 'w',
            example: '1億2000万2500',
        },
        Currency: {
            text: 'Валюта',
            value: '¥0.00',
            example: '¥1200.09',
        },
        Digit: {
            text: 'Десятичные 2 знака',
            value: 'w0.00',
            example: '2万2500.55',
        },
        Date: {
            text: 'Дата',
            value: 'yyyy-MM-dd',
            example: '2017-11-29',
        },
        Time: { text: 'Время', value: 'hh:mm AM/PM', example: '3:00 PM' },
        Time24H: { text: 'Время 24H', value: 'hh:mm', example: '15:00' },
        DateTime: { text: 'Дата и время', value: 'yyyy-MM-dd hh:mm AM/PM', example: '2017-11-29 3:00 PM' },
        DateTime24H: { text: 'Дата и время 24H', value: 'yyyy-MM-dd hh:mm', example: '2017-11-29 15:00' },
        CustomFormats: { text: 'Пользовательские форматы', value: 'fmtOtherSelf', example: '' },
    },
    format: {
        moreCurrency: 'Больше форматов валюты',
        moreDateTime: 'Больше форматов даты и времени',
        moreNumber: 'Больше форматов чисел',

        titleCurrency: 'Форматы валюты',
        decimalPlaces: 'Десятичные знаки',
        titleDateTime: 'Форматы даты и времени',
        titleNumber: 'Числовые форматы',
    },
    print: {
        normalBtn: 'Обычный',
        layoutBtn: 'Макет страницы',
        pageBtn: 'Предпросмотр разрыва страницы',

        menuItemPrint: 'Печать (Ctrl+P)',
        menuItemAreas: 'Области печати',
        menuItemRows: 'Печатать строки заголовков',
        menuItemColumns: 'Печатать столбцы заголовков',
    },
    align: {
        left: 'лево',
        center: 'центр',
        right: 'право',

        top: 'верх',
        middle: 'середина',
        bottom: 'низ',
    },

    button: {
        confirm: 'ОК',
        cancel: 'Отмена',
        close: 'Закрыть',
        update: 'Обновить',
        delete: 'Удалить',
        insert: 'Вставить',
        prevPage: 'Предыдущая',
        nextPage: 'Следующая',
        total: 'всего:',
    },
    punctuation: {
        tab: 'Табуляция',
        semicolon: 'точка с запятой',
        comma: 'запятая',
        space: 'пробел',
    },
    colorPicker: {
        collapse: 'Свернуть',
        customColor: 'ПОЛЬЗ.',
        change: 'Изменить',
        confirmColor: 'ОК',
        cancelColor: 'Отмена',
    },
    borderLine: {
        borderTop: 'верхняя граница',
        borderBottom: 'нижняя граница',
        borderLeft: 'левая граница',
        borderRight: 'правая граница',
        borderNone: 'без границы',
        borderAll: 'все границы',
        borderOutside: 'внешняя граница',
        borderInside: 'внутренняя граница',
        borderHorizontal: 'горизонтальная граница',
        borderVertical: 'вертикальная граница',
        borderColor: 'цвет границы',
        borderSize: 'размер границы',
        borderType: 'тип границы',
    },
    merge: {
        all: 'Объединить все',
        vertical: 'Вертикальное объединение',
        horizontal: 'Горизонтальное объединение',
        cancel: 'Отменить объединение',
        overlappingError: 'Невозможно объединить перекрывающиеся области',
        partiallyError: 'Невозможно выполнить эту операцию на частично объединенных ячейках',
        confirm: {
            title: 'Продолжение объединения сохранит только значение в верхней левой ячейке, остальные значения будут удалены. Вы уверены, что хотите продолжить?',
            cancel: 'Отменить объединение',
            confirm: 'Продолжить объединение',
            waring: 'Предупреждение',
            dismantleMergeCellWaring: 'Это приведет к разделению некоторых объединенных ячеек. Продолжить?',
        },
    },
    filter: {
        confirm: {
            error: 'Произошла ошибка',
            notAllowedToInsertRange: 'Нельзя перемещать ячейки сюда, пока фильтр не будет очищен',
        },
    },
    textWrap: {
        overflow: 'Переполнение',
        wrap: 'Перенос',
        clip: 'Обрезать',
    },
    textRotate: {
        none: 'Нет',
        angleUp: 'Повернуть вверх',
        angleDown: 'Повернуть вниз',
        vertical: 'Вертикально',
        rotationUp: 'Поворот вверх',
        rotationDown: 'Поворот вниз',
    },
    sheetConfig: {
        delete: 'Удалить',
        copy: 'Копировать',
        rename: 'Переименовать',
        changeColor: 'Изменить цвет',
        hide: 'Скрыть',
        unhide: 'Показать',
        moveLeft: 'Переместить влево',
        moveRight: 'Переместить вправо',
        resetColor: 'Сбросить цвет',
        cancelText: 'Отмена',
        chooseText: 'Подтвердить цвет',

        tipNameRepeat: 'Имя вкладки не может повторяться! Пожалуйста, исправьте',
        noMoreSheet:
            'В книге должен содержаться хотя бы один видимый лист. Чтобы удалить выбранный лист, вставьте новый лист или покажите скрытый лист.',
        confirmDelete: 'Вы уверены, что хотите удалить',
        redoDelete: 'Можно отменить с помощью Ctrl+Z',
        noHide: 'Нельзя скрыть, оставьте хотя бы одну вкладку листа',
        chartEditNoOpt: 'Эта операция недоступна в режиме редактирования диаграммы!',
        sheetNameErrorTitle: 'Произошла ошибка',
        sheetNameSpecCharError: "Имя не может превышать 31 символов, начало и конец имени не могут быть ' и имя не может содержать: [ ] : \\ ? * /",
        sheetNameCannotIsEmptyError: 'Имя листа не может быть пустым.',
        sheetNameAlreadyExistsError: 'Имя листа уже существует. Пожалуйста, введите другое имя.',
        deleteSheet: 'Удалить лист',
        deleteSheetContent:
            'Подтвердите удаление этого листа. После удаления его нельзя будет восстановить. Вы уверены, что хотите удалить его?',
        addProtectSheet: 'Защитить лист',
        removeProtectSheet: 'Снять защиту листа',
        changeSheetPermission: 'Изменить разрешения листа',
        viewAllProtectArea: 'Просмотреть все защищенные области',
    },
    rightClick: {
        copy: 'Копировать',
        copyAs: 'Копировать как',
        cut: 'Вырезать',
        paste: 'Вставить',
        pasteSpecial: 'Специальная вставка',
        pasteValue: 'Вставить значение',
        pasteFormat: 'Вставить формат',
        pasteColWidth: 'Вставить ширину столбца',
        pasteBesidesBorder: 'Вставить кроме стилей границы',
        insert: 'Вставить',
        insertRow: 'Вставить строку',
        insertRowBefore: 'Вставить строку выше',
        insertColumn: 'Вставить столбец',
        insertColumnBefore: 'Вставить столбец слева',
        delete: 'Удалить',
        deleteCell: 'Удалить ячейку',
        insertCell: 'Вставить ячейку',
        deleteSelected: 'Удалить выбранное',
        hide: 'Скрыть',
        hideSelected: 'Скрыть выбранное',
        showHide: 'Показать скрытые',
        toTopAdd: 'Добавить сверху',
        toBottomAdd: 'Добавить снизу',
        toLeftAdd: 'Добавить слева',
        toRightAdd: 'Добавить справа',
        deleteSelectedRow: 'Удалить выбранную строку',
        deleteSelectedColumn: 'Удалить выбранный столбец',
        hideSelectedRow: 'Скрыть выбранную строку',
        showHideRow: 'Показать скрытую строку',
        rowHeight: 'Высота строки',
        hideSelectedColumn: 'Скрыть выбранный столбец',
        showHideColumn: 'Показать скрытый столбец',
        columnWidth: 'Ширина столбца',
        to: 'К',
        left: 'Лево',
        right: 'Право',
        top: 'Верх',
        bottom: 'Низ',
        moveLeft: 'Переместить влево',
        moveUp: 'Переместить вверх',
        moveRight: 'Переместить вправо',
        moveDown: 'Переместить вниз',
        add: 'Добавить',
        row: 'Строка',
        column: 'Столбец',
        width: 'Ширина',
        height: 'Высота',
        number: 'Номер',
        confirm: 'Подтвердить',
        orderAZ: 'Порядок А-Я',
        orderZA: 'Порядок Я-А',
        clearSelection: 'Очистить',
        clearContent: 'Очистить содержимое',
        clearFormat: 'Очистить формат',
        clearAll: 'Очистить все',
        matrix: 'Матричная операция',
        sortSelection: 'Сортировать',
        filterSelection: 'Фильтр',
        chartGeneration: 'Создать диаграмму',
        firstLineTitle: 'Заголовок первой строки',
        untitled: 'Без названия',
        array1: 'Одномерный массив',
        array2: 'Двумерный массив',
        array3: 'Многомерные массивы',
        diagonal: 'Диагональ',
        antiDiagonal: 'Антидиагональ',
        diagonalOffset: 'Смещение диагонали',
        offset: 'Смещение',
        boolean: 'Булевый',
        flip: 'Перевернуть',
        upAndDown: 'Вверх и вниз',
        leftAndRight: 'Влево и вправо',
        clockwise: 'По часовой стрелке',
        counterclockwise: 'Против часовой стрелки',
        transpose: 'Транспонировать',
        matrixCalculation: 'Матричное вычисление',
        plus: 'Плюс',
        minus: 'Минус',
        multiply: 'Умножить',
        divided: 'Делить',
        power: 'Степень',
        root: 'Корень',
        log: 'Логарифм',
        delete0: 'Удалить значения 0 с обоих концов',
        removeDuplicate: 'Удалить дубликаты значений',
        byRow: 'По строке',
        byCol: 'По столбцу',
        generateNewMatrix: 'Создать новую матрицу',
        fitContent: 'Подогнать под данные',
        freeze: 'Закрепить',
        freezeCol: 'Закрепить до этого столбца',
        freezeRow: 'Закрепить до этой строки',
        cancelFreeze: 'Отменить закрепление',
        zenEditor: 'Редактор на весь экран',
        deleteAllRowsAlert: 'Нельзя удалить все строки на листе',
        deleteAllColumnsAlert: 'Нельзя удалить все столбцы на листе',
        hideAllRowsAlert: 'Нельзя скрыть все строки на листе',
        hideAllColumnsAlert: 'Нельзя скрыть все столбцы на листе',
        protectRange: 'Защитить диапазон',
        editProtectRange: 'Редактировать защищенный диапазон',
        removeProtectRange: 'Удалить защиту диапазона',
        turnOnProtectRange: 'Включить защиту диапазона',
        viewAllProtectArea: 'Просмотреть все защищенные области',
    },
    info: {
        tooltip: 'Подсказка',
        error: 'Ошибка',
        notChangeMerge: 'Вы не можете частично изменить объединенные ячейки',
        detailUpdate: 'Новый открытый',
        detailSave: 'Восстановлено из локального кэша',
        row: '',
        column: '',
        loading: 'Загрузка...',

        copy: 'Копировать',
        return: 'Выход',
        rename: 'Переименовать',
        tips: 'Переименовать',
        noName: 'Электронная таблица без названия',
        wait: 'ожидание обновления',

        add: 'Добавить',
        addLast: 'больше строк внизу',
        backTop: 'Вернуться наверх',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfo: 'Всего ${total}, ${totalPage} страниц, текущая ${currentPage}',
        nextPage: 'Следующая',

        tipInputNumber: 'Пожалуйста, введите число',
        tipInputNumberLimit: 'Диапазон увеличения ограничен от 1 до 100',

        tipRowHeightLimit: 'Высота строки должна быть в пределах от 0 до 545',
        tipColumnWidthLimit: 'Ширина столбца должна быть в пределах от 0 до 2038',
        // eslint-disable-next-line no-template-curly-in-string
        pageInfoFull: 'Всего ${total}, ${totalPage} страниц, все данные отображены',
        problem: 'Произошла проблема',
        forceStringInfo: 'Число хранится как текст',
    },
    clipboard: {
        paste: {
            exceedMaxCells: 'Количество вставляемых ячеек превышает максимальное количество ячеек',
            overlappingMergedCells: 'Область вставки перекрывается с объединенными ячейками',
        },
        shortCutNotify: {
            title: 'Используйте сочетания клавиш для вставки.',
            useShortCutInstead: 'Обнаружено содержимое Excel. Используйте сочетание клавиш для вставки.',
        },
    },
    statusbar: {
        sum: 'Сумма',
        average: 'Среднее',
        min: 'Минимум',
        max: 'Максимум',
        count: 'Числовое количество',
        countA: 'Количество',
        clickToCopy: 'Нажмите, чтобы скопировать',
        copied: 'Скопировано',
    },
    autoFill: {
        copy: 'Копировать ячейку',
        series: 'Заполнить серию',
        formatOnly: 'Только формат',
        noFormat: 'Без формата',
    },

    rangeSelector: {
        placeholder: 'Выберите диапазон или введите значение',
        tooltip: 'Выберите диапазон',
    },

    shortcut: {
        sheet: {
            'zoom-in': 'Увеличить',
            'zoom-out': 'Уменьшить',
            'reset-zoom': 'Сбросить масштаб',
            'select-below-cell': 'Выбрать ячейку ниже',
            'select-up-cell': 'Выбрать ячейку выше',
            'select-left-cell': 'Выбрать ячейку слева',
            'select-right-cell': 'Выбрать ячейку справа',
            'select-next-cell': 'Выбрать следующую ячейку',
            'select-previous-cell': 'Выбрать предыдущую ячейку',
            'select-up-value-cell': 'Выбрать ячейку выше со значением',
            'select-below-value-cell': 'Выбрать ячейку ниже со значением',
            'select-left-value-cell': 'Выбрать ячейку слева со значением',
            'select-right-value-cell': 'Выбрать ячейку справа со значением',
            'expand-selection-down': 'Расширить выделение вниз',
            'expand-selection-up': 'Расширить выделение вверх',
            'expand-selection-left': 'Расширить выделение влево',
            'expand-selection-right': 'Расширить выделение вправо',
            'expand-selection-to-left-gap': 'Расширить выделение до левого пробела',
            'expand-selection-to-below-gap': 'Расширить выделение до нижнего пробела',
            'expand-selection-to-right-gap': 'Расширить выделение до правого пробела',
            'expand-selection-to-up-gap': 'Расширить выделение до верхнего пробела',
            'select-all': 'Выбрать все',
            'toggle-editing': 'Переключить редактирование',
            'delete-and-start-editing': 'Очистить и начать редактирование',
            'abort-editing': 'Прервать редактирование',
            'break-line': 'Разрыв строки',
            'set-bold': 'Переключить жирный',
            'set-italic': 'Переключить курсив',
            'set-underline': 'Переключить подчеркивание',
            'set-strike-through': 'Переключить зачеркивание',
            'start-editing': 'Начать редактирование',
        },
    },
    'sheet-view': 'Просмотр листа',
    'sheet-edit': 'Редактирование листа',

    definedName: {
        managerTitle: 'Управление именами',
        managerDescription: 'Создайте определенное имя, выбрав ячейки или формулы и введя желаемое имя в текстовое поле.',
        addButton: 'Добавить определенное имя',
        featureTitle: 'Определенные имена',
        ratioRange: 'Диапазон',
        ratioFormula: 'Формула',
        confirm: 'Подтвердить',
        cancel: 'Отмена',
        scopeWorkbook: 'Книга',
        inputNamePlaceholder: 'Введите имя (без пробелов)',
        inputCommentPlaceholder: 'Введите комментарий',
        inputRangePlaceholder: 'Введите диапазон (без пробелов)',
        inputFormulaPlaceholder: 'Введите формулу (без пробелов)',
        nameEmpty: 'Имя не может быть пустым',
        nameDuplicate: 'Имя уже существует',
        formulaOrRefStringEmpty: 'Формула или строка ссылки не может быть пустой',
        formulaOrRefStringInvalid: 'Неверная формула или строка ссылки',
        defaultName: 'ОпределенноеИмя',
        updateButton: 'Обновить',
        deleteButton: 'Удалить',
        deleteConfirmText: 'Вы уверены, что хотите удалить это определенное имя?',
        nameConflict: 'Имя конфликтует с именем функции',
        nameInvalid: 'Имя недействительно',
        nameSheetConflict: 'Имя конфликтует с именем листа',
    },
    uploadLoading: {
        loading: 'Загрузка...',
        error: 'Ошибка',
    },
    permission: {
        toolbarMenu: 'Защита',
        panel: {
            title: 'Защита строк и столбцов',
            name: 'Имя',
            protectedRange: 'Защищенный диапазон',
            permissionDirection: 'Описание разрешения',
            permissionDirectionPlaceholder: 'Введите описание разрешения',
            editPermission: 'Редактировать разрешения',
            onlyICanEdit: 'Только я могу редактировать',
            designedUserCanEdit: 'Назначенные пользователи могут редактировать',
            viewPermission: 'Просмотр разрешений',
            othersCanView: 'Другие могут просматривать',
            noOneElseCanView: 'Никто другой не может просматривать',
            designedPerson: 'Назначенные лица',
            addPerson: 'Добавить человека',
            canEdit: 'Может редактировать',
            canView: 'Может просматривать',
            delete: 'Удалить',
            currentSheet: 'Текущий лист',
            allSheet: 'Все листы',
            edit: 'Редактировать',
            Print: 'Печать',
            Comment: 'Комментировать',
            Copy: 'Копировать',
            SetCellStyle: 'Установить стиль ячейки',
            SetCellValue: 'Установить значение ячейки',
            SetHyperLink: 'Установить гиперссылку',
            Sort: 'Сортировать',
            Filter: 'Фильтровать',
            PivotTable: 'Сводная таблица',
            FloatImage: 'Плавающее изображение',
            RowHeightColWidth: 'Высота строки и ширина столбца',
            RowHeightColWidthReadonly: 'Только для чтения высота строки и ширина столбца',
            FilterReadonly: 'Только для чтения фильтр',
            nameError: 'Имя не может быть пустым',
            created: 'Создано',
            iCanEdit: 'Я могу редактировать',
            iCanNotEdit: 'Я не могу редактировать',
            iCanView: 'Я могу просматривать',
            iCanNotView: 'Я не могу просматривать',
            emptyRangeError: 'Диапазон не может быть пустым',
            rangeOverlapError: 'Диапазон не может пересекаться',
            rangeOverlapOverPermissionError: 'Диапазон не может пересекаться с диапазоном, имеющим те же разрешения',
            InsertHyperlink: 'Вставить гиперссылку',
            SetRowStyle: 'Установить стиль строки',
            SetColumnStyle: 'Установить стиль столбца',
            InsertColumn: 'Вставить столбец',
            InsertRow: 'Вставить строку',
            DeleteRow: 'Удалить строку',
            DeleteColumn: 'Удалить столбец',
            EditExtraObject: 'Редактировать дополнительный объект',
        },
        dialog: {
            allowUserToEdit: 'Разрешить пользователю редактировать',
            allowedPermissionType: 'Допустимые типы разрешений',
            setCellValue: 'Установить значение ячейки',
            setCellStyle: 'Установить стиль ячейки',
            copy: 'Копировать',
            alert: 'Предупреждение',
            alertContent: 'Этот диапазон защищен и в настоящее время недоступен для редактирования. Если вам нужно редактировать, пожалуйста, свяжитесь с создателем.',
            userEmpty: 'нет назначенных лиц, поделитесь ссылкой, чтобы пригласить конкретных людей.',
            listEmpty: 'Вы не установили ни одного защищенного диапазона или листа.',
            commonErr: 'Диапазон защищен, и у вас нет разрешения на выполнение этой операции. Для редактирования свяжитесь с создателем.',
            editErr: 'Диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
            pasteErr: 'Диапазон защищен, и у вас нет разрешения на вставку. Для вставки свяжитесь с создателем.',
            setStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей. Для установки стилей свяжитесь с создателем.',
            copyErr: 'Диапазон защищен, и у вас нет разрешения на копирование. Для копирования свяжитесь с создателем.',
            workbookCopyErr: 'Лист защищен, и у вас нет разрешения на копирование. Для копирования свяжитесь с создателем.',
            setRowColStyleErr: 'Диапазон защищен, и у вас нет разрешения на установку стилей строк и столбцов. Для установки стилей строк и столбцов свяжитесь с создателем.',
            moveRowColErr: 'Диапазон защищен, и у вас нет разрешения на перемещение строк и столбцов. Для перемещения строк и столбцов свяжитесь с создателем.',
            moveRangeErr: 'Диапазон защищен, и у вас нет разрешения на перемещение выделения. Для перемещения выделения свяжитесь с создателем.',
            autoFillErr: 'Диапазон защищен, и у вас нет разрешения на автозаполнение. Для использования автозаполнения свяжитесь с создателем.',
            filterErr: 'Диапазон защищен, и у вас нет разрешения на фильтрацию. Для фильтрации свяжитесь с создателем.',
            operatorSheetErr: 'Лист защищен, и у вас нет разрешения на операции с листом. Для операций с листом свяжитесь с создателем.',
            insertOrDeleteMoveRangeErr: 'Вставленный или удаленный диапазон пересекается с защищенным диапазоном, и эта операция в настоящее время не поддерживается.',
            printErr: 'Лист защищен, и у вас нет разрешения на печать. Для печати свяжитесь с создателем.',
            formulaErr: 'Диапазон или ссылочный диапазон защищен, и у вас нет разрешения на редактирование. Для редактирования свяжитесь с создателем.',
            hyperLinkErr: 'Диапазон защищен, и у вас нет разрешения на установку гиперссылок. Для установки гиперссылок свяжитесь с создателем.',
        },
        button: {
            confirm: 'Подтвердить',
            cancel: 'Отменить',
            addNewPermission: 'Добавить новое разрешение',
        },
    },
};

export default locale;

