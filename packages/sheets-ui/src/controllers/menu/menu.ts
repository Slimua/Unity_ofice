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

import {
    BooleanNumber,
    DEFAULT_STYLES,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_SHEET,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    RANGE_TYPE,
    ThemeService,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { SetInlineFormatCommand, SetTextSelectionsOperation, TextSelectionManagerService } from '@univerjs/docs';
import {
    getCurrentSheetDisabled$,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SelectionManagerService,
    SetBackgroundColorCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetColWidthCommand,
    SetHorizontalTextAlignCommand,
    SetRangeValuesMutation,
    SetRowHeightCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowIsAutoHeightCommand,
    SetWorksheetRowIsAutoHeightMutation,
} from '@univerjs/sheets';

import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    CopyCommand,
    CutCommand,
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    IClipboardInterfaceService,
    IMenuService,
    MenuGroup,
    MenuItemType,
    MenuPosition,
    mergeMenuConfigs,
    PasteCommand,
} from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import {
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../../commands/commands/hide-row-col-confirm.command';
import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import {
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import {
    CancelFrozenCommand,
    SetColumnFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../../commands/commands/set-frozen.command';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { deriveStateFromActiveSheet$ } from './menu-util';

export enum SheetMenuPosition {
    ROW_HEADER_CONTEXT_MENU = 'rowHeaderContextMenu',
    COL_HEADER_CONTEXT_MENU = 'colHeaderContextMenu',
    SHEET_BAR = 'sheetBar',
}

export function FormatPainterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const formatPainterService = accessor.get(IFormatPainterService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetOnceFormatPainterCommand.id);

    return mergeMenuConfigs({
        id: SetOnceFormatPainterCommand.id,
        subId: SetInfiniteFormatPainterCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BrushSingle',
        title: 'Format Painter',
        tooltip: 'toolbar.formatPainter',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            let active = false;

            const status$ = formatPainterService.status$.subscribe((s) => {
                active = s !== FormatPainterStatus.OFF;
                subscriber.next(active);
            });

            subscriber.next(active);

            return () => {
                status$.unsubscribe();
            };
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const contextService = accessor.get(IContextService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeBoldCommand.id);

    return mergeMenuConfigs({
        id: SetRangeBoldCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    let isBold = FontWeight.NORMAL;

                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isBold = range?.getFontWeight();
                    }

                    subscriber.next(isBold === FontWeight.BOLD);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                        contextService.getContextValue(EDITOR_ACTIVATED) &&
                        contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);
                    if (textRun == null) {
                        return;
                    }

                    const bl = textRun.ts?.bl;
                    subscriber.next(bl === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            if (!worksheet) {
                subscriber.next(false);
                return;
            }

            let isBold = FontWeight.NORMAL;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isBold = range?.getFontWeight();
            }
            subscriber.next(isBold === FontWeight.BOLD);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeItalicCommand.id);

    return mergeMenuConfigs({
        id: SetRangeItalicCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    let isItalic = FontItalic.NORMAL;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isItalic = range?.getFontStyle();
                    }

                    subscriber.next(isItalic === FontItalic.ITALIC);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                        contextService.getContextValue(EDITOR_ACTIVATED) &&
                        contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);
                    if (textRun == null) return;

                    const it = textRun.ts?.it;
                    subscriber.next(it === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            let isItalic = FontItalic.NORMAL;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isItalic = range?.getFontStyle();
            }

            subscriber.next(isItalic === FontItalic.ITALIC);
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeUnderlineCommand.id);

    return mergeMenuConfigs({
        id: SetRangeUnderlineCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    let isUnderline;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isUnderline = range?.getUnderline();
                    }

                    subscriber.next(!!(isUnderline && isUnderline.s));
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                        contextService.getContextValue(EDITOR_ACTIVATED) &&
                        contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);
                    if (textRun == null) return;

                    const ul = textRun.ts?.ul;
                    subscriber.next(ul?.s === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            let isUnderline;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isUnderline = range?.getUnderline();
            }

            subscriber.next(!!(isUnderline && isUnderline.s));
            return disposable.dispose;
        })),

        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeStrickThroughCommand.id);

    return mergeMenuConfigs({
        id: SetRangeStrickThroughCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    let st;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        st = range?.getStrikeThrough();
                    }

                    subscriber.next(!!(st && st.s));
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                        contextService.getContextValue(EDITOR_ACTIVATED) &&
                        contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const st = textRun.ts?.st;

                    subscriber.next(st?.s === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            let st;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                st = range?.getStrikeThrough();
            }

            subscriber.next(!!(st && st.s));
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeFontFamilyCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? String(menuItemConfig?.defaultValue) : DEFAULT_STYLES.ff;

    return mergeMenuConfigs({
        id: SetRangeFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_FAMILY_LIST.map((item) => ({
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
                hoverable: true,
            },
            value: item.value,
        })),
        disabled$: getCurrentSheetDisabled$(accessor),
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeValuesMutation.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                let ff;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ff = range?.getFontFamily();
                }

                subscriber.next(ff ?? defaultValue);
            });

            const primary = selectionManagerService.getLast()?.primary;
            let ff;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                ff = range?.getFontFamily();
            }

            subscriber.next(ff ?? defaultValue);
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);
    const disabled$ = getCurrentSheetDisabled$(accessor);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeFontSizeCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? Number(menuItemConfig?.defaultValue) : DEFAULT_STYLES.fs;

    return mergeMenuConfigs({
        id: SetRangeFontSizeCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
                disabled$,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_SIZE_LIST,
        disabled$,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    let fs;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        fs = range?.getFontSize();
                    }
                    subscriber.next(fs ?? defaultValue);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const fs = textRun.ts?.fs;
                    subscriber.next(fs ?? defaultValue);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            let fs;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                fs = range?.getFontSize();
            }
            subscriber.next(fs ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig);
}

export function ResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ResetTextColorCommand.id);

    return mergeMenuConfigs({
        id: ResetTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetRangeTextColorCommand.id,
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRangeTextColorCommand.id);

    return mergeMenuConfigs({
        id: SetRangeTextColorCommand.id,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',

        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultValue = menuItemConfig?.defaultValue ? String(menuItemConfig?.defaultValue) : themeService.getCurrentTheme().textColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetRangeTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultValue);
                }
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ResetBackgroundColorCommand.id);

    return mergeMenuConfigs({
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetBackgroundColorCommand.id,
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetBackgroundColorCommand.id);

    return mergeMenuConfigs({
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultValue = menuItemConfig?.defaultValue ? String(menuItemConfig?.defaultValue) : themeService.getCurrentTheme().primaryColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultValue);
                }
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        label: 'align.left',
        icon: 'LeftJustifyingSingle',
        value: HorizontalAlign.LEFT,
    },
    {
        label: 'align.center',
        icon: 'HorizontallySingle',
        value: HorizontalAlign.CENTER,
    },
    {
        label: 'align.right',
        icon: 'RightJustifyingSingle',
        value: HorizontalAlign.RIGHT,
    },
];

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<HorizontalAlign> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetHorizontalTextAlignCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? (menuItemConfig?.defaultValue as unknown as HorizontalAlign) : HorizontalAlign.LEFT;

    return mergeMenuConfigs({
        id: SetHorizontalTextAlignCommand.id,
        icon: HORIZONTAL_ALIGN_CHILDREN[0].icon,
        positions: [MenuPosition.TOOLBAR_START],
        tooltip: 'toolbar.horizontalAlignMode.main',
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        selections: HORIZONTAL_ALIGN_CHILDREN,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<HorizontalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetHorizontalTextAlignCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                let ha;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ha = range?.getHorizontalAlignment();
                }

                subscriber.next(ha ?? defaultValue);
            });

            const primary = selectionManagerService.getLast()?.primary;
            let ha;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                ha = range?.getHorizontalAlignment();
            }

            subscriber.next(ha ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export const VERTICAL_ALIGN_CHILDREN = [
    {
        label: 'align.top',
        icon: 'AlignTopSingle',
        value: VerticalAlign.TOP,
    },
    {
        label: 'align.middle',
        icon: 'VerticalCenterSingle',
        value: VerticalAlign.MIDDLE,
    },
    {
        label: 'align.bottom',
        icon: 'AlignBottomSingle',
        value: VerticalAlign.BOTTOM,
    },
];

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<VerticalAlign> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetVerticalTextAlignCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? (menuItemConfig?.defaultValue as unknown as VerticalAlign) : VerticalAlign.BOTTOM;

    return mergeMenuConfigs({
        id: SetVerticalTextAlignCommand.id,
        icon: VERTICAL_ALIGN_CHILDREN[2].icon,
        tooltip: 'toolbar.verticalAlignMode.main',
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: VERTICAL_ALIGN_CHILDREN,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<VerticalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetVerticalTextAlignCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                let va;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    va = range?.getVerticalAlignment();
                }

                subscriber.next(va ?? defaultValue);
            });

            const primary = selectionManagerService.getLast()?.primary;
            let va;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                va = range?.getVerticalAlignment();
            }

            subscriber.next(va ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export const TEXT_WRAP_CHILDREN = [
    {
        label: 'textWrap.overflow',
        icon: 'OverflowSingle',
        value: WrapStrategy.OVERFLOW,
    },
    {
        label: 'textWrap.wrap',
        icon: 'AutowrapSingle',
        value: WrapStrategy.WRAP,
    },
    {
        label: 'textWrap.clip',
        icon: 'TruncationSingle',
        value: WrapStrategy.CLIP,
    },
];

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<WrapStrategy> {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetTextWrapCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? (menuItemConfig?.defaultValue as unknown as WrapStrategy) : WrapStrategy.OVERFLOW;

    return mergeMenuConfigs({
        id: SetTextWrapCommand.id,
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: TEXT_WRAP_CHILDREN,
        value$: deriveStateFromActiveSheet$<WrapStrategy>(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextWrapCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                let ws;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ws = range?.getWrapStrategy();
                }

                subscriber.next(ws ?? defaultValue);
            });

            const primary = selectionManagerService.getLast()?.primary;
            let ws;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                ws = range?.getWrapStrategy();
            }

            subscriber.next(ws ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export const TEXT_ROTATE_CHILDREN = [
    {
        label: 'textRotate.none',
        icon: 'NoRotationSingle',
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        icon: 'LeftRotationFortyFiveDegreesSingle',
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        icon: 'RightRotationFortyFiveDegreesSingle',
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        icon: 'VerticalTextSingle',
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        icon: 'LeftRotationNinetyDegreesSingle',
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        icon: 'RightRotationNinetyDegreesSingle',
        value: 90,
    },
];

export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number | string> {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetTextRotationCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? Number(menuItemConfig?.defaultValue) : 0;

    return mergeMenuConfigs({
        id: SetTextRotationCommand.id,
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        selections: TEXT_ROTATE_CHILDREN,
        positions: [MenuPosition.TOOLBAR_START],
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<number | string>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextRotationCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                let tr;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    tr = range?.getTextRotation();
                }

                if (tr?.v === BooleanNumber.TRUE) {
                    subscriber.next('v');
                } else {
                    subscriber.next((tr && tr.a) ?? defaultValue);
                }
            });

            const primary = selectionManagerService.getLast()?.primary;
            let tr;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                tr = range?.getTextRotation();
            }

            if (tr?.v === BooleanNumber.TRUE) {
                subscriber.next('v');
            } else {
                subscriber.next((tr && tr.a) ?? defaultValue);
            }

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

// #region - copy cut paste
// TODO@wzhudev: maybe we should move these menu factory to @univerjs/ui

function menuClipboardDisabledObservable(injector: IAccessor): Observable<boolean> {
    return new Observable((subscriber) => subscriber.next(!injector.get(IClipboardInterfaceService).supportClipboard));
}

export function CopyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CopyCommand.id);

    return mergeMenuConfigs({
        id: CopyCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.copy',
        icon: 'Copy',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    }, menuItemConfig);
}

export function CutMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CutCommand.id);

    return mergeMenuConfigs({
        id: CutCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'contextMenu.cut',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    }, menuItemConfig);
}

export function PasteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(PasteCommand.id);

    return mergeMenuConfigs({
        id: PasteCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.paste',
        icon: 'PasteSpecial',
        disabled$: menuClipboardDisabledObservable(accessor),
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    }, menuItemConfig);
}

export const PASTE_SPECIAL_MENU_ID = 'sheet.menu.paste-special';
export function PasteSpacialMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(PASTE_SPECIAL_MENU_ID);

    return mergeMenuConfigs({
        id: PASTE_SPECIAL_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.SUBITEMS,
        icon: 'PasteSpecial',
        title: 'rightClick.pasteSpecial',
        disabled$: menuClipboardDisabledObservable(accessor),
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    }, menuItemConfig);
}

export function PasteValueMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SheetPasteValueCommand.id);

    return mergeMenuConfigs({
        id: SheetPasteValueCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteValue',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    }, menuItemConfig);
}

export function PasteFormatMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SheetPasteFormatCommand.id);

    return mergeMenuConfigs({
        id: SheetPasteFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteFormat',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    }, menuItemConfig);
}

export function PasteColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SheetPasteColWidthCommand.id);

    return mergeMenuConfigs({
        id: SheetPasteColWidthCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteColWidth',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    }, menuItemConfig);
}

export function PasteBesidesBorderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SheetPasteBesidesBorderCommand.id);

    return mergeMenuConfigs({
        id: SheetPasteBesidesBorderCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteBesidesBorder',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    }, menuItemConfig);
}

export function FitContentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetWorksheetRowIsAutoHeightCommand.id);

    return mergeMenuConfigs({
        id: SetWorksheetRowIsAutoHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        icon: 'AutoHeight',
        title: 'rightClick.fitContent',
    }, menuItemConfig);
}

export const SHEET_FROZEN_MENU_ID = 'sheet.menu.sheet-frozen';

export function SheetFrozenMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SHEET_FROZEN_MENU_ID);

    return mergeMenuConfigs({
        id: SHEET_FROZEN_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        positions: [MenuPosition.CONTEXT_MENU],
    }, menuItemConfig);
}

export const SHEET_FROZEN_HEADER_MENU_ID = 'sheet.header-menu.sheet-frozen';

export function SheetFrozenHeaderMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SHEET_FROZEN_HEADER_MENU_ID);

    return mergeMenuConfigs({
        id: SHEET_FROZEN_HEADER_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
    }, menuItemConfig);
}

export function FrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetSelectionFrozenCommand.id);

    return mergeMenuConfigs({
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID, SHEET_FROZEN_HEADER_MENU_ID],
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
    }, menuItemConfig);
}

export function FrozenRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRowFrozenCommand.id);

    return mergeMenuConfigs({
        id: SetRowFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID],
        title: 'rightClick.freezeRow',
        icon: 'FreezeRowSingle',
    }, menuItemConfig);
}

export function FrozenColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetColumnFrozenCommand.id);

    return mergeMenuConfigs({
        id: SetColumnFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID],
        title: 'rightClick.freezeCol',
        icon: 'FreezeColumnSingle',
    }, menuItemConfig);
}

export function CancelFrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CancelFrozenCommand.id);

    return mergeMenuConfigs({
        id: CancelFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID, SHEET_FROZEN_HEADER_MENU_ID],
        title: 'rightClick.cancelFreeze',
        icon: 'CancelFreezeSingle',
    }, menuItemConfig);
}

export function HideRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(HideRowConfirmCommand.id);

    return mergeMenuConfigs({
        id: HideRowConfirmCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        icon: 'Hide',
        title: 'rightClick.hideSelectedRow',
    }, menuItemConfig);
}

export function HideColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(HideColConfirmCommand.id);

    return mergeMenuConfigs({
        id: HideColConfirmCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        icon: 'Hide',
        title: 'rightClick.hideSelectedColumn',
    }, menuItemConfig);
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);
    const commandService = accessor.get(ICommandService);

    const affectedCommands = [SetSelectionsOperation, SetRowHiddenMutation, SetRowVisibleMutation].map((c) => c.id);

    const menuItemConfig = menuService.getMenuConfig(SetSelectedRowsVisibleCommand.id);

    return mergeMenuConfigs({
        id: SetSelectedRowsVisibleCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideRow',
        hidden$: deriveStateFromActiveSheet$(univerInstanceService, true, ({ worksheet }) => new Observable((subscriber) => {
            function hasHiddenRowsInSelections(): boolean {
                const rowRanges = selectionManagerService.getSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.ROW);
                return !!rowRanges?.some((range) => {
                    for (let r = range.startRow; r <= range.endRow; r++) {
                        if (!worksheet.getRowRawVisible(r)) return true; // should not take filtered out rows into account
                    }

                    return false;
                });
            }

            const disposable = commandService.onCommandExecuted((command) => {
                if (affectedCommands.findIndex((c) => c === command.id) !== -1) subscriber.next(!hasHiddenRowsInSelections());
            });

            // it only shows when selected area has hidden rows
            subscriber.next(!hasHiddenRowsInSelections());
            return () => disposable.dispose();
        })),
    }, menuItemConfig);
}

export function ShowColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const commandService = accessor.get(ICommandService);
    const affectedCommands = [SetSelectionsOperation, SetColHiddenMutation, SetColVisibleMutation].map((c) => c.id);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetSelectedColsVisibleCommand.id);

    return mergeMenuConfigs({
        id: SetSelectedColsVisibleCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideColumn',
        hidden$: deriveStateFromActiveSheet$(univerInstanceService, true, ({ worksheet }) => new Observable((subscriber) => {
            function hasHiddenColsInSelections(): boolean {
                const colRanges = selectionManagerService.getSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
                if (!colRanges || colRanges.length === 0) return false;

                return !!colRanges.some((range) => {
                    for (let r = range.startColumn; r <= range.endColumn; r++) {
                        if (!worksheet.getColVisible(r)) return true;
                    }

                    return false;
                });
            }

            const disposable = commandService.onCommandExecuted((commandInfo) => {
                if (affectedCommands.findIndex((c) => c === commandInfo.id) !== -1) subscriber.next(!hasHiddenColsInSelections());
            });

            subscriber.next(!hasHiddenColsInSelections());
            return () => disposable.dispose();
        })),
    }, menuItemConfig);
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetRowHeightCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? Number(menuItemConfig?.defaultValue) : 0;

    return mergeMenuConfigs({
        id: SetRowHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'AdjustHeight',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
                min: 2,
                max: 1000,
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                const rowHeight = primary ? worksheet.getRowHeight(primary.startRow) : defaultValue;
                subscriber.next(rowHeight);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetRowIsAutoHeightMutation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
    }, menuItemConfig);
}

export function SetColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetColWidthCommand.id);
    const defaultValue = menuItemConfig?.defaultValue ? Number(menuItemConfig?.defaultValue) : 0;

    return mergeMenuConfigs({
        id: SetColWidthCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'AdjustWidth',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
                min: 2,
                max: 1000,
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                let colWidth: number = defaultValue;
                if (primary != null) {
                    colWidth = worksheet.getColumnWidth(primary.startColumn);
                }

                subscriber.next(colWidth);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetColWidthMutation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
    }, menuItemConfig);
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset <= ed);
    return textRun;
}
