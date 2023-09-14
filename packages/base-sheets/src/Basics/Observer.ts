import { ISelectionRange, Observable, Plugin } from '@univerjs/core';

interface ISelectionControlFillConfig {
    //TODO ...
}

interface ISelectionControlDragAndDropConfig {
    //TODO ...
}

export type SheetPluginObserve = {
    // onAfterChangeFontFamilyObservable: Observable<string>;
    // onAfterChangeFontSizeObservable: Observable<number>;
    // onAfterChangeFontWeightObservable: Observable<boolean>;
    // onAfterChangeFontItalicObservable: Observable<boolean>;
    // onAfterChangeFontStrikethroughObservable: Observable<boolean>;
    // onAfterChangeFontUnderlineObservable: Observable<boolean>;
    // onAfterChangeFontBackgroundObservable: Observable<string>;
    // onAfterChangeFontColorObservable: Observable<string>;

    onDragAndDropStartObserver: Observable<ISelectionControlDragAndDropConfig>;

    onDragAndDroppingObserver: Observable<ISelectionControlDragAndDropConfig>;

    onDragAndDropEndEndObserver: Observable<ISelectionControlDragAndDropConfig>;

    onFillStartObserver: Observable<ISelectionControlFillConfig>;

    onFillingObserver: Observable<ISelectionControlFillConfig>;

    onFillEndObserver: Observable<ISelectionControlFillConfig>;

    onChangeSelectionObserver: Observable<ISelectionRange>;

    onChangeCurrentSheetObserver: Observable<string>;

    // onSpreadsheetKeyDownObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyUpObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyCopyObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyPasteObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyCutObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyCompositionStartObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyCompositionUpdateObservable: Observable<IKeyboardEvent>;
    // onSpreadsheetKeyCompositionEndObservable: Observable<IKeyboardEvent>;
};

export function uninstall(plugin: Plugin) {
    // plugin.deleteObserve('onAfterChangeFontFamilyObservable');
    // plugin.deleteObserve('onAfterChangeFontSizeObservable');
    // plugin.deleteObserve('onAfterChangeFontWeightObservable');
    // plugin.deleteObserve('onAfterChangeFontItalicObservable');
    // plugin.deleteObserve('onAfterChangeFontStrikethroughObservable');
    // plugin.deleteObserve('onAfterChangeFontUnderlineObservable');
    // plugin.deleteObserve('onAfterChangeFontBackgroundObservable');
    // plugin.deleteObserve('onAfterChangeFontColorObservable');

    plugin.deleteObserve('onDragAndDropStartObserver');
    plugin.deleteObserve('onDragAndDroppingObserver');
    plugin.deleteObserve('onDragAndDropEndEndObserver');
    plugin.deleteObserve('onFillStartObserver');
    plugin.deleteObserve('onFillingObserver');
    plugin.deleteObserve('onFillEndObserver');
    plugin.deleteObserve('onChangeSelectionObserver');
    plugin.deleteObserve('onChangeCurrentSheetObserver');
    // plugin.deleteObserve('onSpreadsheetKeyDownObservable');
    // plugin.deleteObserve('onSpreadsheetKeyUpObservable');
    // plugin.deleteObserve('onSpreadsheetKeyCopyObservable');
    // plugin.deleteObserve('onSpreadsheetKeyPasteObservable');
    // plugin.deleteObserve('onSpreadsheetKeyCutObservable');
    // plugin.deleteObserve('onSpreadsheetKeyCompositionStartObservable');
    // plugin.deleteObserve('onSpreadsheetKeyCompositionUpdateObservable');
    // plugin.deleteObserve('onSpreadsheetKeyCompositionEndObservable');
}

export function install(plugin: Plugin) {
    // plugin.pushToObserve('onAfterChangeFontFamilyObservable');
    // plugin.pushToObserve('onAfterChangeFontSizeObservable');
    // plugin.pushToObserve('onAfterChangeFontWeightObservable');
    // plugin.pushToObserve('onAfterChangeFontItalicObservable');
    // plugin.pushToObserve('onAfterChangeFontStrikethroughObservable');
    // plugin.pushToObserve('onAfterChangeFontUnderlineObservable');
    // plugin.pushToObserve('onAfterChangeFontBackgroundObservable');
    // plugin.pushToObserve('onAfterChangeFontColorObservable');

    plugin.pushToObserve('onDragAndDropStartObserver');
    plugin.pushToObserve('onDragAndDroppingObserver');
    plugin.pushToObserve('onDragAndDropEndEndObserver');
    plugin.pushToObserve('onFillStartObserver');
    plugin.pushToObserve('onFillingObserver');
    plugin.pushToObserve('onFillEndObserver');
    plugin.pushToObserve('onChangeSelectionObserver');

    plugin.pushToObserve('onChangeCurrentSheetObserver');

    // plugin.pushToObserve('onSpreadsheetKeyDownObservable');
    // plugin.pushToObserve('onSpreadsheetKeyUpObservable');
    // plugin.pushToObserve('onSpreadsheetKeyCopyObservable');
    // plugin.pushToObserve('onSpreadsheetKeyPasteObservable');
    // plugin.pushToObserve('onSpreadsheetKeyCutObservable');
    // plugin.pushToObserve('onSpreadsheetKeyCompositionStartObservable');
    // plugin.pushToObserve('onSpreadsheetKeyCompositionUpdateObservable');
    // plugin.pushToObserve('onSpreadsheetKeyCompositionEndObservable');
}
