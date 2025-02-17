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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { UniFormulaService } from '../services/uni-formula.service';

export interface IAddDocUniFormulaMutationParams {
    unitId: string;

    f: string;

    /** Range id. It is also used as the formula id. */
    rangeId: string;
}

export const AddDocUniFormulaMutation: IMutation<IAddDocUniFormulaMutationParams> = {
    type: CommandType.MUTATION,
    id: 'doc.mutation.add-doc-uni-formula',
    handler(accesstor, params: IAddDocUniFormulaMutationParams) {
        const { unitId, f, rangeId: id } = params;
        const uniFormulaService = accesstor.get(UniFormulaService);

        uniFormulaService.registerDocFormula(unitId, id, f);

        return true;
    },
};

export interface IUpdateDocUniFormulaMutationParams extends IAddDocUniFormulaMutationParams {
}

export const UpdateDocUniFormulaMutation: IMutation<IUpdateDocUniFormulaMutationParams> = {
    type: CommandType.MUTATION,
    id: 'doc.mutation.update-doc-uni-formula',
    handler(accessor, params: IUpdateDocUniFormulaMutationParams) {
        const { unitId, f, rangeId: id } = params;
        const uniFormulaService = accessor.get(UniFormulaService);

        if (!uniFormulaService.hasFocFormula(unitId, id)) {
            return false;
        }

        uniFormulaService.unregisterDocFormula(unitId, id);
        uniFormulaService.registerDocFormula(unitId, id, f);
        return true;
    },
};

export interface IRemoveDocUniFormulaMutationParams {
    unitId: string;
    rangeId: string;
}

export const RemoveDocUniFormulaMutation: IMutation<IRemoveDocUniFormulaMutationParams> = {
    type: CommandType.MUTATION,
    id: 'doc.mutation.remove-doc-uni-formula',
    handler(accessor, params: IRemoveDocUniFormulaMutationParams) {
        const { unitId, rangeId: id } = params;
        const uniFormulaService = accessor.get(UniFormulaService);

        if (!uniFormulaService.hasFocFormula(unitId, id)) {
            return false;
        }

        uniFormulaService.unregisterDocFormula(unitId, id);
        return true;
    },
};
