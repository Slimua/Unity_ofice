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

import { FUNCTION_NAMES_LOOKUP, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_LOOKUP: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_LOOKUP.ADDRESS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.ADDRESS.description',
        abstract: 'formula.functionList.ADDRESS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ADDRESS.functionParameter.row_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.row_num.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.column_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.column_num.detail',
                example: '2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.abs_num.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.abs_num.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.a1.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.a1.detail',
                example: 'TRUE',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ADDRESS.functionParameter.sheet_text.name',
                detail: 'formula.functionList.ADDRESS.functionParameter.sheet_text.detail',
                example: 'Sheet2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.AREAS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.AREAS.description',
        abstract: 'formula.functionList.AREAS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.AREAS.functionParameter.number1.name',
                detail: 'formula.functionList.AREAS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.AREAS.functionParameter.number2.name',
                detail: 'formula.functionList.AREAS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.CHOOSE,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.CHOOSE.description',
        abstract: 'formula.functionList.CHOOSE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHOOSE.functionParameter.number1.name',
                detail: 'formula.functionList.CHOOSE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHOOSE.functionParameter.number2.name',
                detail: 'formula.functionList.CHOOSE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.CHOOSECOLS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.CHOOSECOLS.description',
        abstract: 'formula.functionList.CHOOSECOLS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHOOSECOLS.functionParameter.number1.name',
                detail: 'formula.functionList.CHOOSECOLS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHOOSECOLS.functionParameter.number2.name',
                detail: 'formula.functionList.CHOOSECOLS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.CHOOSEROWS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.CHOOSEROWS.description',
        abstract: 'formula.functionList.CHOOSEROWS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHOOSEROWS.functionParameter.number1.name',
                detail: 'formula.functionList.CHOOSEROWS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHOOSEROWS.functionParameter.number2.name',
                detail: 'formula.functionList.CHOOSEROWS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.COLUMN,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.COLUMN.description',
        abstract: 'formula.functionList.COLUMN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.COLUMN.functionParameter.reference.name',
                detail: 'formula.functionList.COLUMN.functionParameter.reference.detail',
                example: 'A1:A20',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.COLUMNS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.COLUMNS.description',
        abstract: 'formula.functionList.COLUMNS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.COLUMNS.functionParameter.array.name',
                detail: 'formula.functionList.COLUMNS.functionParameter.array.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.DROP,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.DROP.description',
        abstract: 'formula.functionList.DROP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DROP.functionParameter.number1.name',
                detail: 'formula.functionList.DROP.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DROP.functionParameter.number2.name',
                detail: 'formula.functionList.DROP.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.EXPAND,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.EXPAND.description',
        abstract: 'formula.functionList.EXPAND.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EXPAND.functionParameter.number1.name',
                detail: 'formula.functionList.EXPAND.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EXPAND.functionParameter.number2.name',
                detail: 'formula.functionList.EXPAND.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.FILTER,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.FILTER.description',
        abstract: 'formula.functionList.FILTER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FILTER.functionParameter.number1.name',
                detail: 'formula.functionList.FILTER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FILTER.functionParameter.number2.name',
                detail: 'formula.functionList.FILTER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.FORMULATEXT,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.FORMULATEXT.description',
        abstract: 'formula.functionList.FORMULATEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FORMULATEXT.functionParameter.number1.name',
                detail: 'formula.functionList.FORMULATEXT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FORMULATEXT.functionParameter.number2.name',
                detail: 'formula.functionList.FORMULATEXT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.GETPIVOTDATA,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.GETPIVOTDATA.description',
        abstract: 'formula.functionList.GETPIVOTDATA.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.GETPIVOTDATA.functionParameter.number1.name',
                detail: 'formula.functionList.GETPIVOTDATA.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.GETPIVOTDATA.functionParameter.number2.name',
                detail: 'formula.functionList.GETPIVOTDATA.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.HLOOKUP,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.HLOOKUP.description',
        abstract: 'formula.functionList.HLOOKUP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HLOOKUP.functionParameter.lookupValue.name',
                detail: 'formula.functionList.HLOOKUP.functionParameter.lookupValue.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HLOOKUP.functionParameter.tableArray.name',
                detail: 'formula.functionList.HLOOKUP.functionParameter.tableArray.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HLOOKUP.functionParameter.rowIndexNum.name',
                detail: 'formula.functionList.HLOOKUP.functionParameter.rowIndexNum.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HLOOKUP.functionParameter.rangeLookup.name',
                detail: 'formula.functionList.HLOOKUP.functionParameter.rangeLookup.detail',
                example: 'false',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.HSTACK,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.HSTACK.description',
        abstract: 'formula.functionList.HSTACK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HSTACK.functionParameter.number1.name',
                detail: 'formula.functionList.HSTACK.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HSTACK.functionParameter.number2.name',
                detail: 'formula.functionList.HSTACK.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.HYPERLINK,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.HYPERLINK.description',
        abstract: 'formula.functionList.HYPERLINK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.HYPERLINK.functionParameter.number1.name',
                detail: 'formula.functionList.HYPERLINK.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.HYPERLINK.functionParameter.number2.name',
                detail: 'formula.functionList.HYPERLINK.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.IMAGE,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.IMAGE.description',
        abstract: 'formula.functionList.IMAGE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.IMAGE.functionParameter.number1.name',
                detail: 'formula.functionList.IMAGE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.IMAGE.functionParameter.number2.name',
                detail: 'formula.functionList.IMAGE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.INDEX,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.INDEX.description',
        abstract: 'formula.functionList.INDEX.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.INDEX.functionParameter.reference.name',
                detail: 'formula.functionList.INDEX.functionParameter.reference.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.INDEX.functionParameter.rowNum.name',
                detail: 'formula.functionList.INDEX.functionParameter.rowNum.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.INDEX.functionParameter.columnNum.name',
                detail: 'formula.functionList.INDEX.functionParameter.columnNum.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.INDEX.functionParameter.areaNum.name',
                detail: 'formula.functionList.INDEX.functionParameter.areaNum.detail',
                example: '2',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.INDIRECT,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.INDIRECT.description',
        abstract: 'formula.functionList.INDIRECT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.INDIRECT.functionParameter.refText.name',
                detail: 'formula.functionList.INDIRECT.functionParameter.refText.detail',
                example: '"A1"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.INDIRECT.functionParameter.a1.name',
                detail: 'formula.functionList.INDIRECT.functionParameter.a1.detail',
                example: 'TRUE',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.LOOKUP,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.LOOKUP.description',
        abstract: 'formula.functionList.LOOKUP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LOOKUP.functionParameter.lookupValue.name',
                detail: 'formula.functionList.LOOKUP.functionParameter.lookupValue.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LOOKUP.functionParameter.lookupVectorOrArray.name',
                detail: 'formula.functionList.LOOKUP.functionParameter.lookupVectorOrArray.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LOOKUP.functionParameter.resultVector.name',
                detail: 'formula.functionList.LOOKUP.functionParameter.resultVector.detail',
                example: 'A1:A20',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.MATCH,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.MATCH.description',
        abstract: 'formula.functionList.MATCH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MATCH.functionParameter.lookupValue.name',
                detail: 'formula.functionList.MATCH.functionParameter.lookupValue.detail',
                example: '10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MATCH.functionParameter.lookupArray.name',
                detail: 'formula.functionList.MATCH.functionParameter.lookupArray.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MATCH.functionParameter.matchType.name',
                detail: 'formula.functionList.MATCH.functionParameter.matchType.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.OFFSET,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.OFFSET.description',
        abstract: 'formula.functionList.OFFSET.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.OFFSET.functionParameter.reference.name',
                detail: 'formula.functionList.OFFSET.functionParameter.reference.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OFFSET.functionParameter.rows.name',
                detail: 'formula.functionList.OFFSET.functionParameter.rows.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OFFSET.functionParameter.cols.name',
                detail: 'formula.functionList.OFFSET.functionParameter.cols.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OFFSET.functionParameter.height.name',
                detail: 'formula.functionList.OFFSET.functionParameter.height.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.OFFSET.functionParameter.width.name',
                detail: 'formula.functionList.OFFSET.functionParameter.width.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.ROW,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.ROW.description',
        abstract: 'formula.functionList.ROW.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ROW.functionParameter.reference.name',
                detail: 'formula.functionList.ROW.functionParameter.reference.detail',
                example: 'A1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.ROWS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.ROWS.description',
        abstract: 'formula.functionList.ROWS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ROWS.functionParameter.array.name',
                detail: 'formula.functionList.ROWS.functionParameter.array.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.RTD,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.RTD.description',
        abstract: 'formula.functionList.RTD.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.RTD.functionParameter.number1.name',
                detail: 'formula.functionList.RTD.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.RTD.functionParameter.number2.name',
                detail: 'formula.functionList.RTD.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.SORT,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.SORT.description',
        abstract: 'formula.functionList.SORT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SORT.functionParameter.number1.name',
                detail: 'formula.functionList.SORT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SORT.functionParameter.number2.name',
                detail: 'formula.functionList.SORT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.SORTBY,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.SORTBY.description',
        abstract: 'formula.functionList.SORTBY.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SORTBY.functionParameter.number1.name',
                detail: 'formula.functionList.SORTBY.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SORTBY.functionParameter.number2.name',
                detail: 'formula.functionList.SORTBY.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.TAKE,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.TAKE.description',
        abstract: 'formula.functionList.TAKE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TAKE.functionParameter.number1.name',
                detail: 'formula.functionList.TAKE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TAKE.functionParameter.number2.name',
                detail: 'formula.functionList.TAKE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.TOCOL,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.TOCOL.description',
        abstract: 'formula.functionList.TOCOL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TOCOL.functionParameter.number1.name',
                detail: 'formula.functionList.TOCOL.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TOCOL.functionParameter.number2.name',
                detail: 'formula.functionList.TOCOL.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.TOROW,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.TOROW.description',
        abstract: 'formula.functionList.TOROW.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TOROW.functionParameter.number1.name',
                detail: 'formula.functionList.TOROW.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TOROW.functionParameter.number2.name',
                detail: 'formula.functionList.TOROW.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.TRANSPOSE,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.TRANSPOSE.description',
        abstract: 'formula.functionList.TRANSPOSE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TRANSPOSE.functionParameter.number1.name',
                detail: 'formula.functionList.TRANSPOSE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TRANSPOSE.functionParameter.number2.name',
                detail: 'formula.functionList.TRANSPOSE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.UNIQUE,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.UNIQUE.description',
        abstract: 'formula.functionList.UNIQUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.UNIQUE.functionParameter.number1.name',
                detail: 'formula.functionList.UNIQUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.UNIQUE.functionParameter.number2.name',
                detail: 'formula.functionList.UNIQUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.VLOOKUP,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.VLOOKUP.description',
        abstract: 'formula.functionList.VLOOKUP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VLOOKUP.functionParameter.lookupValue.name',
                detail: 'formula.functionList.VLOOKUP.functionParameter.lookupValue.detail',
                example: 'B2',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VLOOKUP.functionParameter.tableArray.name',
                detail: 'formula.functionList.VLOOKUP.functionParameter.tableArray.detail',
                example: 'C2:E7',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VLOOKUP.functionParameter.colIndexNum.name',
                detail: 'formula.functionList.VLOOKUP.functionParameter.colIndexNum.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VLOOKUP.functionParameter.rangeLookup.name',
                detail: 'formula.functionList.VLOOKUP.functionParameter.rangeLookup.detail',
                example: 'TRUE',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.VSTACK,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.VSTACK.description',
        abstract: 'formula.functionList.VSTACK.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VSTACK.functionParameter.number1.name',
                detail: 'formula.functionList.VSTACK.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VSTACK.functionParameter.number2.name',
                detail: 'formula.functionList.VSTACK.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.WRAPCOLS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.WRAPCOLS.description',
        abstract: 'formula.functionList.WRAPCOLS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WRAPCOLS.functionParameter.number1.name',
                detail: 'formula.functionList.WRAPCOLS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WRAPCOLS.functionParameter.number2.name',
                detail: 'formula.functionList.WRAPCOLS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.WRAPROWS,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.WRAPROWS.description',
        abstract: 'formula.functionList.WRAPROWS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.WRAPROWS.functionParameter.number1.name',
                detail: 'formula.functionList.WRAPROWS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.WRAPROWS.functionParameter.number2.name',
                detail: 'formula.functionList.WRAPROWS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.XLOOKUP,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.XLOOKUP.description',
        abstract: 'formula.functionList.XLOOKUP.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.lookupValue.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.lookupValue.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.lookupArray.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.lookupArray.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.returnArray.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.returnArray.detail',
                example: 'B1:B20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.ifNotFound.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.ifNotFound.detail',
                example: 'default',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.matchMode.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.matchMode.detail',
                example: '0',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XLOOKUP.functionParameter.searchMode.name',
                detail: 'formula.functionList.XLOOKUP.functionParameter.searchMode.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_LOOKUP.XMATCH,
        functionType: FunctionType.Lookup,
        description: 'formula.functionList.XMATCH.description',
        abstract: 'formula.functionList.XMATCH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.XMATCH.functionParameter.lookupValue.name',
                detail: 'formula.functionList.XMATCH.functionParameter.lookupValue.detail',
                example: 'B1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XMATCH.functionParameter.lookupArray.name',
                detail: 'formula.functionList.XMATCH.functionParameter.lookupArray.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XMATCH.functionParameter.matchMode.name',
                detail: 'formula.functionList.XMATCH.functionParameter.matchMode.detail',
                example: '0',
                require: 0,
                repeat: 0,
            },
            {
                name: 'formula.functionList.XMATCH.functionParameter.searchMode.name',
                detail: 'formula.functionList.XMATCH.functionParameter.searchMode.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
];
