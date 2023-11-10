import {
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    CopySheetCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SelectionManagerService,
    SetBackgroundColorCommand,
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetColWidthCommand,
    SetHorizontalTextAlignCommand,
    SetRangeStyleMutation,
    SetRangeValuesMutation,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetTabColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetHideCommand,
    SetWorksheetRowIsAutoHeightCommand,
    SetWorksheetShowCommand,
    SheetPermissionService,
} from '@univerjs/base-sheets';
import {
    CopyCommand,
    CutCommand,
    IMenuButtonItem,
    IMenuSelectorItem,
    MenuGroup,
    MenuItemType,
    MenuPosition,
    PasteCommand,
} from '@univerjs/base-ui';
import {
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { RenameSheetOperation } from '../../commands/commands/rename.command';
import {
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import { SetSelectionFrozenCommand } from '../../commands/commands/set-frozen.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

export { SetBorderColorMenuItemFactory, SetBorderStyleMenuItemFactory } from './border.menu';

export enum SheetMenuPosition {
    ROW_HEADER_CONTEXT_MENU = 'rowHeaderContextMenu',
    COL_HEADER_CONTEXT_MENU = 'colHeaderContextMenu',
    SHEET_BAR = 'sheetBar',
}

export function FormatPainterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const formatPainterService = accessor.get(IFormatPainterService);
    return {
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
    };
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeBoldCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isBold = FontWeight.NORMAL;

                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    isBold = range?.getFontWeight();
                }

                subscriber.next(isBold === FontWeight.BOLD);
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeItalicCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isItalic = FontItalic.NORMAL;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    isItalic = range?.getFontStyle();
                }

                subscriber.next(isItalic === FontItalic.ITALIC);
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeUnderlineCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isUnderline;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    isUnderline = range?.getUnderline();
                }

                subscriber.next(!!(isUnderline && isUnderline.s));
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeStrickThroughCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let st;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    st = range?.getStrikeThrough();
                }

                subscriber.next(!!(st && st.s));
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export const FONT_SIZE_CHILDREN = [
    {
        label: '9',
        value: 9,
    },
    {
        label: '10',
        value: 10,
    },
    {
        label: '11',
        value: 11,
    },
    {
        label: '12',
        value: 12,
    },
    {
        label: '14',
        value: 14,
    },
    {
        label: '16',
        value: 16,
    },
    {
        label: '18',
        value: 18,
    },
    {
        label: '20',
        value: 20,
    },

    {
        label: '22',
        value: 22,
    },
    {
        label: '24',
        value: 24,
    },
    {
        label: '26',
        value: 26,
    },
    {
        label: '28',
        value: 28,
    },
    {
        label: '36',
        value: 36,
    },
    {
        label: '48',
        value: 48,
    },
    {
        label: '72',
        value: 72,
    },
];

export const FONT_FAMILY_CHILDREN = [
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Times New Roman',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Arial',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Tahoma',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Verdana',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Microsoft YaHei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'SimSun',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'SimHei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Kaiti',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'FangSong',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'NSimSun',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STXinwei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STXingkai',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STLiti',
    },
    // The following 3 fonts do not work, temporarily delete
    // {
    //     label: 'fontFamily.HanaleiFill',
    //     style: { 'font-family': 'HanaleiFill' },
    //     value: 'HanaleiFill',
    // },
    // {
    //     label: 'fontFamily.Anton',
    //     style: { 'font-family': 'Anton' },
    //     value: 'Anton',
    // },
    // {
    //     label: 'fontFamily.Pacifico',
    //     style: { 'font-family': 'Pacifico' },
    //     value: 'Pacifico',
    // },
];

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_FAMILY_CHILDREN,
        disabled$: new Observable((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        value$: new Observable((subscriber) => {
            const defaultValue = FONT_FAMILY_CHILDREN[0].value;

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ff;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ff = range?.getFontFamily();
                }

                subscriber.next(ff ?? defaultValue);
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
    };
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: SetRangeFontSizeCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_SIZE_CHILDREN,
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
        value$: new Observable((subscriber) => {
            const DEFAULT_SIZE = 14;
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let fs;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    fs = range?.getFontSize();
                }

                subscriber.next(fs ?? DEFAULT_SIZE);
            });

            subscriber.next(DEFAULT_SIZE);

            return disposable.dispose;
        }),
    };
}

export function ResetTextColorMenuItemFactory(): IMenuButtonItem {
    return {
        id: ResetTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        positions: SetRangeTextColorCommand.id,
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetRangeTextColorCommand.id,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = '#000';
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetRangeTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
    };
}

export function ResetBackgroundColorMenuItemFactory(): IMenuButtonItem {
    return {
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        positions: SetBackgroundColorCommand.id,
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = '#fff';
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
    };
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
    return {
        id: SetHorizontalTextAlignCommand.id,
        icon: HORIZONTAL_ALIGN_CHILDREN[0].icon,
        positions: [MenuPosition.TOOLBAR_START],
        tooltip: 'toolbar.horizontalAlignMode.main',
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        selections: HORIZONTAL_ALIGN_CHILDREN,
        value$: new Observable<HorizontalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetHorizontalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ha;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ha = range?.getHorizontalAlignment();
                }

                subscriber.next(ha ?? HorizontalAlign.LEFT);
            });

            subscriber.next(HorizontalAlign.LEFT);

            return disposable.dispose;
        }),
    };
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
    return {
        id: SetVerticalTextAlignCommand.id,
        icon: VERTICAL_ALIGN_CHILDREN[0].icon,
        tooltip: 'toolbar.verticalAlignMode.main',
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: VERTICAL_ALIGN_CHILDREN,
        value$: new Observable<VerticalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetVerticalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let va;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    va = range?.getVerticalAlignment();
                }

                subscriber.next(va ?? VerticalAlign.TOP);
            });

            subscriber.next(VerticalAlign.TOP);

            return disposable.dispose;
        }),
    };
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextWrapCommand.id,
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: TEXT_WRAP_CHILDREN,
        value$: new Observable((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextWrapCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ws;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ws = range?.getWrapStrategy();
                }

                subscriber.next(ws ?? WrapStrategy.OVERFLOW);
            });

            subscriber.next(WrapStrategy.OVERFLOW);

            return disposable.dispose;
        }),
    };
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextRotationCommand.id,
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SELECTOR,
        selections: TEXT_ROTATE_CHILDREN,
        positions: [MenuPosition.TOOLBAR_START],
        value$: new Observable<number | string>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextRotationCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let tr;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    tr = range?.getTextRotation();
                }

                subscriber.next((tr && tr.a) ?? 0);
            });

            subscriber.next(0);

            return disposable.dispose;
        }),
    };
}

// #region - copy cut paste
// TODO@wzhudev: maybe we should move these menu factory to base-ui

export function CopyMenuItemFactory(): IMenuButtonItem {
    return {
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
    };
}

export function CutMenuItemFactory(): IMenuButtonItem {
    return {
        id: CutCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'contextMenu.cut',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function PasteMenuItemFactory(): IMenuButtonItem {
    return {
        id: PasteCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.paste',
        icon: 'PasteSpecial',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

// #endregion
const CLEAR_SELECTION_MENU_ID = 'sheet.menu.clear-selection';
export function ClearSelectionMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: CLEAR_SELECTION_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.SUBITEMS,
        icon: 'ClearFormat',
        title: 'rightClick.clearSelection',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function ClearSelectionContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}
export function ClearSelectionFormatMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearFormat',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}
export function ClearSelectionAllMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearAll',
        positions: [CLEAR_SELECTION_MENU_ID],
    };
}

const COL_INSERT_MENU_ID = 'sheet.menu.col-insert';
export function ColInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: COL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'ClearFormat',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
    };
}
const ROW_INSERT_MENU_ID = 'sheet.menu.row-insert';
export function RowInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: ROW_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'ClearFormat',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
    };
}
const CELL_INSERT_MENU_ID = 'sheet.menu.cell-insert';
export function CellInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: CELL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'ClearFormat',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);

    return {
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRowBefore',
        positions: [ROW_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [ROW_INSERT_MENU_ID],
        title: 'rightClick.insertRow',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        title: 'rightClick.insertColumnBefore',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID],
        title: 'rightClick.insertColumn',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertRangeMoveRightMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveRightCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        positions: [CELL_INSERT_MENU_ID],
    };
}

export function InsertRangeMoveDownMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveDownCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        positions: [CELL_INSERT_MENU_ID],
    };
}

const DELETE_RANGE_MENU_ID = 'sheet.menu.delete';
export function DeleteRangeMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: DELETE_RANGE_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.delete',
        icon: 'ClearFormat',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function RemoveColMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveColCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [DELETE_RANGE_MENU_ID, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}

export function RemoveRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveRowCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [DELETE_RANGE_MENU_ID, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveLeftCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveLeft',
        positions: [DELETE_RANGE_MENU_ID],
    };
}

export function DeleteRangeMoveUpMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveUpCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveUp',
        positions: [DELETE_RANGE_MENU_ID],
    };
}

export function FitContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetWorksheetRowIsAutoHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.fitContent',
    };
}

export function FrozenMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
        title: 'rightClick.freeze',
    };
}

export function HideRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetRowHiddenCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.hideSelectedRow',
    };
}

export function HideColMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetColHiddenCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.hideSelectedColumn',
    };
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    function hasHiddenRowsInSelections(): boolean {
        const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
        const rowRanges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);

        return !!rowRanges?.some((range) => {
            for (let r = range.startRow; r <= range.endRow; r++) {
                if (!worksheet.getRowVisible(r)) {
                    return true;
                }
            }

            return false;
        });
    }

    const commandService = accessor.get(ICommandService);

    return {
        id: SetSelectedRowsVisibleCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideRow',
        hidden$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (
                    c.id === SetSelectionsOperation.id ||
                    c.id === SetRowHiddenMutation.id ||
                    c.id === SetRowVisibleMutation.id
                ) {
                    subscriber.next(!hasHiddenRowsInSelections());
                }
            });

            // it only shows when selected area has hidden rows
            subscriber.next(!hasHiddenRowsInSelections());
            return () => disposable.dispose();
        }),
    };
}

export function ShowColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    function hasHiddenColsInSelections(): boolean {
        const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
        const colRanges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);

        return !!colRanges?.some((range) => {
            for (let r = range.startRow; r <= range.endRow; r++) {
                if (!worksheet.getColVisible(r)) {
                    return true;
                }
            }

            return false;
        });
    }

    const commandService = accessor.get(ICommandService);

    return {
        id: SetSelectedColsVisibleCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideColumn',
        hidden$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (
                    c.id === SetSelectionsOperation.id ||
                    c.id === SetColHiddenMutation.id ||
                    c.id === SetColVisibleMutation.id
                ) {
                    subscriber.next(!hasHiddenColsInSelections());
                }
            });

            subscriber.next(!hasHiddenColsInSelections());
            return () => disposable.dispose();
        }),
    };
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRowHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let rowHeight;
                if (primary != null) {
                    rowHeight = worksheet.getRowHeight(primary.startRow);
                }

                subscriber.next(rowHeight ?? 0);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === SetRangeStyleMutation.id ||
                    id === SetRangeValuesMutation.id ||
                    id === SetSelectionsOperation.id
                ) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

export function SetColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetColWidthCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();

                let colWidth: number = 0;
                if (primary != null) {
                    colWidth = worksheet.getColumnWidth(primary.startColumn);
                }

                subscriber.next(colWidth);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === SetRangeStyleMutation.id ||
                    id === SetRangeValuesMutation.id ||
                    id === SetSelectionsOperation.id
                ) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

// right menu in main sheet bar
export function DeleteSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveSheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
    };
}

export function CopySheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: CopySheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.copy',
    };
}

export function RenameSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: RenameSheetOperation.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.rename',
    };
}

export function ChangeColorSheetMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: SetTabColorCommand.id,
        title: 'sheetConfig.changeColor',
        positions: [SheetMenuPosition.SHEET_BAR],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
            },
        ],
    };
}

export function HideSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetWorksheetHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.hide',
    };
}

export function UnHideSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<any> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const hiddenList = workbook.getHiddenWorksheets().map((s) => ({
        label: workbook.getSheetBySheetId(s)?.getName() || '',
        value: s,
    }));

    return {
        id: SetWorksheetShowCommand.id,
        type: MenuItemType.SELECTOR,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
        disabled$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                    return;
                }
                const newList = workbook.getHiddenWorksheets();
                subscriber.next(newList.length === 0);
            });
            subscriber.next(hiddenList.length === 0);
            return disposable.dispose;
        }),
        selections: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                    return;
                }
                const newList = workbook.getHiddenWorksheets().map((s) => ({
                    label: workbook.getSheetBySheetId(s)?.getName() || '',
                    value: s,
                }));
                subscriber.next(newList);
            });
            subscriber.next(hiddenList);
            return disposable.dispose;
        }),
    };
}

export function ShowMenuItemFactory(): IMenuButtonItem {
    return {
        id: ShowMenuListCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
    };
}
