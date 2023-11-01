import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
} from '@univerjs/base-sheets';
import {
    ComponentManager,
    IDesktopUIController,
    IMenuItemFactory,
    IMenuService,
    IShortcutService,
    IUIController,
} from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';

import { RenameSheetOperation } from '../commands/commands/rename.command';
import {
    SetCopySelectionCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../commands/commands/set-format-painter.command';
import {
    ExpandSelectionCommand,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
} from '../commands/commands/set-selection.command';
import { ShowMenuListCommand } from '../commands/commands/unhide.command';
import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
} from '../commands/operations/cell-edit.operation';
import { SetFormatPainterOperation } from '../commands/operations/set-format-painter.operation';
import { BORDER_LINE_COMPONENT, BorderLine } from '../components/border-line';
import { COLOR_PICKER_COMPONENT, ColorPicker } from '../components/color-picker';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../components/font-family';
import { MENU_ITEM_INPUT_COMPONENT, MenuItemInput } from '../components/menu-item-input';
import { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from '../View/SheetContainer/SheetContainer';
import { CellBorderSelectorMenuItemFactory } from './menu/border.menu';
import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    ChangeColorSheetMenuItemFactory,
    ClearSelectionAllMenuItemFactory,
    ClearSelectionContentMenuItemFactory,
    ClearSelectionFormatMenuItemFactory,
    CopyMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteRangeMenuItemFactory,
    DeleteRangeMoveLeftMenuItemFactory,
    DeleteRangeMoveUpMenuItemFactory,
    DeleteSheetMenuItemFactory,
    FitContentMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    FormatPainterMenuItemFactory,
    FrozenMenuItemFactory,
    HideColMenuItemFactory,
    HideRowMenuItemFactory,
    HideSheetMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    InsertColAfterMenuItemFactory,
    InsertColBeforeMenuItemFactory,
    InsertRangeMenuItemFactory,
    InsertRangeMoveDownMenuItemFactory,
    InsertRangeMoveRightMenuItemFactory,
    InsertRowAfterMenuItemFactory,
    InsertRowBeforeMenuItemFactory,
    ItalicMenuItemFactory,
    PasteMenuItemFactory,
    RemoveColMenuItemFactory,
    RemoveRowMenuItemFactory,
    RenameSheetMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    SetBorderColorMenuItemFactory,
    SetBorderStyleMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
    ShowColMenuItemFactory,
    ShowMenuItemFactory,
    ShowRowMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    VerticalAlignMenuItemFactory,
    WrapTextMenuItemFactory,
} from './menu/menu';
import {
    CellMergeAllMenuItemFactory,
    CellMergeCancelMenuItemFactory,
    CellMergeHorizontalMenuItemFactory,
    CellMergeMenuItemFactory,
    CellMergeVerticalMenuItemFactory,
} from './menu/merge.menu';
import {
    EditorBreakLineShortcut,
    EditorCursorEnterShortcut,
    EditorCursorEscShortcut,
    EditorCursorTabShortcut,
    EditorDeleteLeftShortcut,
    EditorDeleteLeftShortcutInActive,
    generateArrowSelectionShortCuItem,
} from './shortcuts/editor.shortcut';
import { SetColHiddenShortcutItem, SetRowHiddenShortcutItem } from './shortcuts/operation.shortcut';
import {
    ExpandSelectionDownShortcutItem,
    ExpandSelectionEndDownShortcutItem,
    ExpandSelectionEndLeftShortcutItem,
    ExpandSelectionEndRightShortcutItem,
    ExpandSelectionEndUpShortcutItem,
    ExpandSelectionLeftShortcutItem,
    ExpandSelectionRightShortcutItem,
    ExpandSelectionUpShortcutItem,
    MoveBackSelectionShortcutItem,
    MoveSelectionDownShortcutItem,
    MoveSelectionEndDownShortcutItem,
    MoveSelectionEndLeftShortcutItem,
    MoveSelectionEndRightShortcutItem,
    MoveSelectionEndUpShortcutItem,
    MoveSelectionEnterShortcutItem,
    MoveSelectionEnterUpShortcutItem,
    MoveSelectionLeftShortcutItem,
    MoveSelectionRightShortcutItem,
    MoveSelectionTabLeftShortcutItem,
    MoveSelectionTabShortcutItem,
    MoveSelectionUpShortcutItem,
    SelectAllShortcutItem,
} from './shortcuts/selection.shortcut';
import {
    SetBoldShortcutItem,
    SetItalicShortcutItem,
    SetStrikeThroughShortcutItem,
    SetUnderlineShortcutItem,
} from './shortcuts/style.shortcut';
import { ClearSelectionValueShortcutItem } from './shortcuts/value.shortcut';
import { ResetZoomShortcutItem, ZoomInShortcutItem, ZoomOutShortcutItem } from './shortcuts/view.shortcut';

@OnLifecycle(LifecycleStages.Ready, SheetUIController)
export class SheetUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIController private readonly _uiController: IDesktopUIController
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // init custom component
        const componentManager = this._componentManager;

        // FIXME: no dispose logic
        componentManager.register(MENU_ITEM_INPUT_COMPONENT, MenuItemInput);
        componentManager.register(BORDER_LINE_COMPONENT, BorderLine);
        componentManager.register(COLOR_PICKER_COMPONENT, ColorPicker);
        componentManager.register(FONT_FAMILY_COMPONENT, FontFamily);
        componentManager.register(FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem);

        // init commands
        [
            MoveSelectionCommand,
            MoveSelectionEnterAndTabCommand,
            ExpandSelectionCommand,
            SelectAllCommand,
            SetBoldCommand,
            SetItalicCommand,
            SetStrikeThroughCommand,
            SetUnderlineCommand,
            SetFontFamilyCommand,
            SetFontSizeCommand,

            ShowMenuListCommand,
            RenameSheetOperation,

            SetCellEditVisibleOperation,

            SetCellEditVisibleArrowOperation,

            SetActivateCellEditOperation,
            SetOnceFormatPainterCommand,
            SetCopySelectionCommand,
            SetInfiniteFormatPainterCommand,
            SetFormatPainterOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });

        // init menus
        (
            [
                // context menu
                CopyMenuItemFactory,
                PasteMenuItemFactory,

                ClearSelectionContentMenuItemFactory,
                ClearSelectionFormatMenuItemFactory,
                ClearSelectionAllMenuItemFactory,
                InsertRowBeforeMenuItemFactory,
                InsertRowAfterMenuItemFactory,
                InsertColBeforeMenuItemFactory,
                InsertColAfterMenuItemFactory,
                RemoveRowMenuItemFactory,
                HideRowMenuItemFactory,
                ShowRowMenuItemFactory,
                HideColMenuItemFactory,
                ShowColMenuItemFactory,
                RemoveColMenuItemFactory,
                SetRowHeightMenuItemFactory,
                FitContentMenuItemFactory,
                SetColWidthMenuItemFactory,
                DeleteRangeMenuItemFactory,
                DeleteRangeMoveLeftMenuItemFactory,
                DeleteRangeMoveUpMenuItemFactory,
                InsertRangeMenuItemFactory,
                InsertRangeMoveRightMenuItemFactory,
                InsertRangeMoveDownMenuItemFactory,
                FrozenMenuItemFactory,

                // toolbar
                FormatPainterMenuItemFactory,
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
                FontFamilySelectorMenuItemFactory,
                FontSizeSelectorMenuItemFactory,
                ResetTextColorMenuItemFactory,
                TextColorSelectorMenuItemFactory,
                BackgroundColorSelectorMenuItemFactory,
                ResetBackgroundColorMenuItemFactory,
                CellBorderSelectorMenuItemFactory,
                SetBorderColorMenuItemFactory,
                SetBorderStyleMenuItemFactory,
                CellMergeMenuItemFactory,
                CellMergeAllMenuItemFactory,
                CellMergeVerticalMenuItemFactory,
                CellMergeHorizontalMenuItemFactory,
                CellMergeCancelMenuItemFactory,
                HorizontalAlignMenuItemFactory,
                VerticalAlignMenuItemFactory,
                WrapTextMenuItemFactory,
                TextRotateMenuItemFactory,

                // sheetbar
                DeleteSheetMenuItemFactory,
                CopySheetMenuItemFactory,
                RenameSheetMenuItemFactory,
                ChangeColorSheetMenuItemFactory,
                HideSheetMenuItemFactory,
                ShowMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });

        // init shortcuts
        [
            // selection shortcuts
            MoveSelectionDownShortcutItem,
            MoveSelectionUpShortcutItem,
            MoveSelectionLeftShortcutItem,
            MoveSelectionRightShortcutItem,
            MoveSelectionTabShortcutItem,
            MoveSelectionTabLeftShortcutItem,
            MoveSelectionEnterShortcutItem,
            MoveSelectionEnterUpShortcutItem,
            MoveBackSelectionShortcutItem,
            MoveSelectionEndDownShortcutItem,
            MoveSelectionEndUpShortcutItem,
            MoveSelectionEndLeftShortcutItem,
            MoveSelectionEndRightShortcutItem,
            ExpandSelectionDownShortcutItem,
            ExpandSelectionUpShortcutItem,
            ExpandSelectionLeftShortcutItem,
            ExpandSelectionRightShortcutItem,
            ExpandSelectionEndDownShortcutItem,
            ExpandSelectionEndUpShortcutItem,
            ExpandSelectionEndLeftShortcutItem,
            ExpandSelectionEndRightShortcutItem,
            SelectAllShortcutItem,

            // view shortcuts
            ZoomInShortcutItem,
            ZoomOutShortcutItem,
            ResetZoomShortcutItem,

            // toggle cell style shortcuts
            SetBoldShortcutItem,
            SetItalicShortcutItem,
            SetUnderlineShortcutItem,
            SetStrikeThroughShortcutItem,

            // cell content editing shortcuts
            ClearSelectionValueShortcutItem,
            ...generateArrowSelectionShortCuItem(),
            EditorCursorEnterShortcut,
            EditorCursorTabShortcut,
            EditorBreakLineShortcut,
            EditorDeleteLeftShortcut,
            EditorDeleteLeftShortcutInActive,
            EditorCursorEscShortcut,

            // operation shortcuts
            SetRowHiddenShortcutItem,
            SetColHiddenShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });

        this.disposeWithMe(
            this._uiController.registerHeaderComponent(() => connectInjector(RenderSheetHeader, this._injector))
        );

        this.disposeWithMe(
            this._uiController.registerFooterComponent(() => connectInjector(RenderSheetFooter, this._injector))
        );

        this.disposeWithMe(
            this._uiController.registerContentComponent(() => connectInjector(RenderSheetContent, this._injector))
        );
    }
}
