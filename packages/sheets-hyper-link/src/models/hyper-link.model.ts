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

import { Subject } from 'rxjs';
import { Disposable, ObjectMatrix } from '@univerjs/core';
import type { ICellHyperLink, ICellLinkContent } from '../types/interfaces/i-hyper-link';

type LinkUpdate = {
    type: 'add';
    payload: ICellHyperLink;
    unitId: string;
    subUnitId: string;
} | {
    type: 'remove';
    payload: ICellHyperLink;
    unitId: string;
    subUnitId: string;
} | {
    type: 'update';
    unitId: string;
    subUnitId: string;
    payload: ICellLinkContent;
    id: string;
} | {
    type: 'updateRef';
    unitId: string;
    subUnitId: string;
    id: string;
    payload: { row: number; column: number };
} | {
    type: 'unload';
    unitId: string;
    unitLinks: {
        unitId: string;
        subUnitId: string;
        links: ICellHyperLink[];
    }[];
};

export class HyperLinkModel extends Disposable {
    private _linkUpdate$ = new Subject<LinkUpdate>();
    linkUpdate$ = this._linkUpdate$.asObservable();

    private _linkMap: Map<string, Map<string, ObjectMatrix<ICellHyperLink>>> = new Map();
    private _linkPositionMap: Map<string, Map<string, Map<string, { row: number; column: number; link: ICellHyperLink }>>> = new Map();

    constructor() {
        super();
        this.disposeWithMe({
            dispose: () => {
                this._linkUpdate$.complete();
            },
        });
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._linkMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._linkMap.set(unitId, unitMap);
        }
        let matrix = unitMap.get(subUnitId);
        if (!matrix) {
            matrix = new ObjectMatrix();
            unitMap.set(subUnitId, matrix);
        }

        let positionUnitMap = this._linkPositionMap.get(unitId);
        if (!positionUnitMap) {
            positionUnitMap = new Map();
            this._linkPositionMap.set(unitId, positionUnitMap);
        }

        let positionSubUnitMap = positionUnitMap.get(subUnitId);
        if (!positionSubUnitMap) {
            positionSubUnitMap = new Map();
            positionUnitMap.set(subUnitId, positionSubUnitMap);
        }
        return {
            matrix,
            positionMap: positionSubUnitMap,
        };
    }

    addHyperLink(unitId: string, subUnitId: string, link: ICellHyperLink) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        matrix.setValue(link.row, link.column, link);
        positionMap.set(link.id, { row: link.row, column: link.column, link });
        this._linkUpdate$.next({
            unitId,
            subUnitId,
            payload: link,
            type: 'add',
        });
        return true;
    }

    updateHyperLink(unitId: string, subUnitId: string, id: string, payload: Partial<ICellLinkContent>, silent?: boolean) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        // const current = matrix.getValue();
        const position = positionMap.get(id);
        if (!position) {
            return false;
        }
        const link = matrix.getValue(position.row, position.column);
        if (!link) {
            return false;
        }
        Object.assign(link, payload);
        if (!silent) {
            this._linkUpdate$.next({
                unitId,
                subUnitId,
                payload: {
                    display: link.display,
                    payload: link.payload,
                },
                id,
                type: 'update',
            });
        }
        return true;
    }

    updateHyperLinkRef(unitId: string, subUnitId: string, id: string, payload: { row: number; column: number }, silent = false) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        // const current = matrix.getValue();
        const position = positionMap.get(id);
        if (!position) {
            return false;
        }

        let link = matrix.getValue(position.row, position.column);
        if (!link || link.id !== id) {
            link = position.link;
        } else {
            matrix.realDeleteValue(position.row, position.column);
        }
        Object.assign(link, payload);
        positionMap.set(id, { ...payload, link });
        matrix.setValue(payload.row, payload.column, link);
        if (!silent) {
            this._linkUpdate$.next({
                unitId,
                subUnitId,
                payload,
                id,
                type: 'updateRef',
            });
        }
        return true;
    }

    removeHyperLink(unitId: string, subUnitId: string, id: string) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        const position = positionMap.get(id);
        if (!position) {
            return false;
        }
        positionMap.delete(id);
        const link = matrix.getValue(position.row, position.column);
        if (link && link.id === id) {
            matrix.realDeleteValue(position.row, position.column);
        }

        this._linkUpdate$.next({
            unitId,
            subUnitId,
            payload: link,
            type: 'remove',
        });
        return true;
    }

    getHyperLink(unitId: string, subUnitId: string, id: string) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        const position = positionMap.get(id);
        if (!position) {
            return undefined;
        }
        return matrix.getValue(position.row, position.column);
    }

    getHyperLinkByLocation(unitId: string, subUnitId: string, row: number, column: number): ICellHyperLink | undefined {
        const { matrix } = this._ensureMap(unitId, subUnitId);

        return matrix.getValue(row, column);
    }

    getSubUnit(unitId: string, subUnitId: string) {
        const { matrix } = this._ensureMap(unitId, subUnitId);

        const links: ICellHyperLink[] = [];
        matrix.forValue((row, col, value) => {
            if (value) {
                links.push(value);
            }
        });

        return links;
    }

    getUnit(unitId: string) {
        const unitMap = this._linkMap.get(unitId);
        if (!unitMap) {
            return [];
        }

        return Array.from(unitMap.keys()).map((subUnitId) => {
            const links = this.getSubUnit(unitId, subUnitId);
            return {
                unitId,
                subUnitId,
                links,
            };
        });
    }

    deleteUnit(unitId: string) {
        const links = this.getUnit(unitId);
        this._linkMap.delete(unitId);
        this._linkPositionMap.delete(unitId);

        this._linkUpdate$.next({
            type: 'unload',
            unitId,
            unitLinks: links,
        });
    }

    getAll() {
        const unitIds = Array.from(this._linkMap.keys());
        return unitIds.map((unitId) => this.getUnit(unitId));
    }
}
