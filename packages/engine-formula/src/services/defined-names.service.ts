import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface IDefinedNamesService {
    registerDefinedName(unitId: string, name: string, reference: string): void;

    getDefinedNameMap(unitId: string): Nullable<Map<string, string>>;

    getValue(unitId: string, name: string): Nullable<string>;
}

export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, Map<string, string>> = new Map();

    override dispose(): void {
        this._definedNameMap.clear();
    }

    registerDefinedName(unitId: string, name: string, reference: string) {
        const unitMap = this._definedNameMap.get(unitId);

        if (unitMap == null) {
            this._definedNameMap.set(unitId, new Map());
        }

        this._definedNameMap.get(unitId)?.set(name, reference);
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap.get(unitId);
    }

    getValue(unitId: string, name: string) {
        return this._definedNameMap.get(unitId)?.get(name);
    }
}

export const IDefinedNamesService = createIdentifier<DefinedNamesService>('univer.formula.defined-names.service');
