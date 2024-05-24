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

import type { Observable } from 'rxjs';
import { createIdentifier } from '@wendellhu/redi';
import type { Nullable } from '../../common/type-utils';
import { LifecycleStages, runOnLifecycle } from '../lifecycle/lifecycle';
import type { IRange } from '../../types/interfaces';

export enum PermissionStatus {
    INIT = 'init',
    FETCHING = 'fetching',
    DONE = 'done',
}

export enum PermissionType {
    WORK_BOOK = 'WORK_BOOK',
    WORK_SHEET = 'WORK_SHEET',
    SHEET_RANGE = 'SHEET_RANGE',
}

export enum UnitPermissionType {
    Edit = 'Edit',
    View = 'View',
    Share = 'Share',
    Duplicate = 'Duplicate',
    Export = 'Export',
    Comment = 'Comment',
    Print = 'Print',
    Copy = 'Copy',
    ManageCollaborator = 'ManageCollaborator',
    MoveSheet = 'MoveSheet',
    DeleteSheet = 'DeleteSheet',
    HideSheet = 'HideSheet',
    RenameSheet = 'RenameSheet',
    CreateSheet = 'CreateSheet',
    CopySheet = 'CopySheet',
    History = 'History',
}

export enum SubUnitPermissionType {
    Edit = 'Edit',
    Copy = 'Copy',
    SelectProtectedCells = 'SelectProtectedCells',
    SelectUnProtectedCells = 'SelectUnProtectedCells',
    SetCellStyle = 'SetCellStyle',
    SetCellValue = 'SetCellValue',
    View = 'View',
    SetRowStyle = 'SetRowStyle',
    SetColumnStyle = 'SetColumnStyle',
    InsertRow = 'InsertRow',
    InsertColumn = 'InsertColumn',
    InsertHyperlink = 'InsertHyperlink',
    DeleteRow = 'DeleteRow',
    DeleteColumn = 'DeleteColumn',
    Sort = 'Sort',
    Filter = 'Filter',
    PivotTable = 'PivotTable',
    EditExtraObject = 'EditExtraObject',
    UnRecognized = 'UnRecognized',
    ManageCollaborator = 'ManageCollaborator',
}

export interface IPermissionTypes {
    rangeTypes?: RangeUnitPermissionType[];
    worksheetTypes?: SubUnitPermissionType[];
    workbookTypes?: UnitPermissionType[];
}

export enum RangeUnitPermissionType {
    Edit = 'Edit',
    View = 'View',
    ManageCollaborator = 'ManageCollaborator',
}
export type IUnitPermissionId = `${PermissionType}.${UnitPermissionType}`;
export type ISubUnitPermissionId = `${PermissionType}.${SubUnitPermissionType}`;
export type IRangePermissionId = `${PermissionType}.${RangeUnitPermissionType}`;

export interface IPermissionPoint<V = boolean> {
    type: PermissionType;
    /**
     * ${PermissionType}.${SubUnitPermissionType}_${id}
     */
    id: IUnitPermissionId | ISubUnitPermissionId | IRangePermissionId;
    status: PermissionStatus;
    subType: UnitPermissionType | SubUnitPermissionType | RangeUnitPermissionType;
    value: V;
}

export interface IPermissionParam {
    unitId: string;
    subUnitId: string;
    range?: IRange;
}

export interface IPermissionService {
    permissionPointUpdate$: Observable<IPermissionPoint<unknown>>;
    deletePermissionPoint(permissionId: string): void;
    addPermissionPoint<T = boolean>(permissionPoint: IPermissionPoint<T>): boolean;
    updatePermissionPoint<T = boolean>(permissionId: string, value: T): void;
    getPermissionPoint<T = boolean>(permissionId: string): Nullable<IPermissionPoint<T>>;
    getPermissionPoint$<T = boolean>(permissionId: string): Nullable<Observable<IPermissionPoint<T>>>;
    clearPermissionMap(): void;

    composePermission$(permissionId: string[]): Observable<IPermissionPoint<unknown>[]>;
    composePermission(permissionId: string[]): IPermissionPoint<unknown>[];
}
// composePermission$(permissionIdList: string[]): Observable<IPermissionPoint[]>;
// composePermission(permissionIdList: string[]): IPermissionPoint[];

export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');
runOnLifecycle(LifecycleStages.Starting, IPermissionService);
