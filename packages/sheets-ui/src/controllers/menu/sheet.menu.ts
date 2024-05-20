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

import type { Workbook } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    CopySheetCommand,
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorCommand,
    SetWorksheetHideCommand,
    SetWorksheetHideMutation,
    SetWorksheetShowCommand,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { IMenuService, MenuItemType, mergeMenuConfigs } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { RemoveSheetConfirmCommand } from '../../commands/commands/remove-sheet-confirm.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { RenameSheetOperation } from '../../commands/operations/rename-sheet.operation';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { SheetMenuPosition } from './menu';

export function DeleteSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(RemoveSheetConfirmCommand.id);

    return mergeMenuConfigs({
        id: RemoveSheetConfirmCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
        disabled$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === RemoveSheetMutation.id ||
                    id === InsertSheetMutation.id ||
                    id === SetWorksheetHideMutation.id
                ) {
                    const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                    // loop through all worksheets Map to see if there is more than one visible sheet
                    const visibleSheets = Array.from(worksheets.values()).filter(
                        (sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE
                    );

                    subscriber.next(visibleSheets.length === 1);
                }
            });
            subscriber.next(false);
            return disposable.dispose;
        }),
    }, menuItemConfig);
}

export function CopySheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CopySheetCommand.id);

    return mergeMenuConfigs({
        id: CopySheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.copy',
    }, menuItemConfig);
}

export function RenameSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(RenameSheetOperation.id);

    return mergeMenuConfigs({
        id: RenameSheetOperation.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.rename',
    }, menuItemConfig);
}

export function ChangeColorSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetTabColorCommand.id);

    return mergeMenuConfigs({
        id: SetTabColorCommand.id,
        title: 'sheetConfig.changeColor',
        positions: [SheetMenuPosition.SHEET_BAR],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
    }, menuItemConfig);
}

export function HideSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetWorksheetHideCommand.id);

    return mergeMenuConfigs({
        id: SetWorksheetHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.hide',
        disabled$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === RemoveSheetMutation.id ||
                    id === InsertSheetMutation.id ||
                    id === SetWorksheetHideMutation.id
                ) {
                    const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                    // loop through all worksheets Map to see if there is more than one visible sheet
                    const visibleSheets = Array.from(worksheets.values()).filter(
                        (sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE
                    );

                    subscriber.next(visibleSheets.length === 1);
                }
            });
            subscriber.next(false);
            return disposable.dispose;
        }),
    }, menuItemConfig);
}

export function UnHideSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<any> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetWorksheetShowCommand.id);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const hiddenList = workbook.getHiddenWorksheets().map((s) => ({
        label: workbook.getSheetBySheetId(s)?.getName() || '',
        value: s,
    }));

    return mergeMenuConfigs({
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
    }, menuItemConfig);
}

export function ShowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ShowMenuListCommand.id);

    return mergeMenuConfigs({
        id: ShowMenuListCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
        disabled$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === RemoveSheetMutation.id ||
                    id === InsertSheetMutation.id ||
                    id === SetWorksheetHideMutation.id
                ) {
                    const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                    // loop through all worksheets Map to see if there is more than one sheet
                    const visibleSheets = Array.from(worksheets.values());

                    subscriber.next(visibleSheets.length === 1);
                }
            });
            subscriber.next(false);
            return disposable.dispose;
        }),
    }, menuItemConfig);
}
