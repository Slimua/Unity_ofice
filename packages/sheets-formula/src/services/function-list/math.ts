import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FUNCTION_NAMES, FunctionType } from '@univerjs/engine-formula';

export const FUNCTION_LIST_MATH: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES.SUM,
        aliasFunctionName: 'formula.functionList.SUM.aliasFunctionName',
        functionType: FunctionType.Math,
        description: 'formula.functionList.SUM.description',
        abstract: 'formula.functionList.SUM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SUM.functionParameter.number1.name',
                detail: 'formula.functionList.SUM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SUM.functionParameter.number2.name',
                detail: 'formula.functionList.SUM.functionParameter.number2.detail',
                example: 'B2:B10',
                require: 0,
                repeat: 1,
            },
        ],
    },
];
