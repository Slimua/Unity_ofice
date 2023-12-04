import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IFormulaData } from '@univerjs/engine-formula';
import type { IAccessor } from '@wendellhu/redi';

import { FormulaDataModel } from '../../models/formula-data.model';

export interface ISetFormulaDataMutationParams {
    formulaData: IFormulaData;
}

export const SetFormulaDataMutation: IMutation<ISetFormulaDataMutationParams> = {
    id: 'formula.mutation.set-formula-data',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFormulaDataMutationParams) => {
        const formulaDataModel = accessor.get(FormulaDataModel);
        formulaDataModel.setFormulaData(params.formulaData);
        return true;
    },
};
