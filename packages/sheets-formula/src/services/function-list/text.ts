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

import { FUNCTION_NAMES_TEXT, FunctionType, type IFunctionInfo } from '@univerjs/engine-formula';

export const FUNCTION_LIST_TEXT: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_TEXT.ASC,
        functionType: FunctionType.Text,
        description: 'formula.functionList.ASC.description',
        abstract: 'formula.functionList.ASC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ASC.functionParameter.number1.name',
                detail: 'formula.functionList.ASC.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ASC.functionParameter.number2.name',
                detail: 'formula.functionList.ASC.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.ARRAYTOTEXT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.ARRAYTOTEXT.description',
        abstract: 'formula.functionList.ARRAYTOTEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ARRAYTOTEXT.functionParameter.number1.name',
                detail: 'formula.functionList.ARRAYTOTEXT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ARRAYTOTEXT.functionParameter.number2.name',
                detail: 'formula.functionList.ARRAYTOTEXT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.BAHTTEXT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.BAHTTEXT.description',
        abstract: 'formula.functionList.BAHTTEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.BAHTTEXT.functionParameter.number1.name',
                detail: 'formula.functionList.BAHTTEXT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.BAHTTEXT.functionParameter.number2.name',
                detail: 'formula.functionList.BAHTTEXT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CHAR,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CHAR.description',
        abstract: 'formula.functionList.CHAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CHAR.functionParameter.number1.name',
                detail: 'formula.functionList.CHAR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CHAR.functionParameter.number2.name',
                detail: 'formula.functionList.CHAR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CLEAN,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CLEAN.description',
        abstract: 'formula.functionList.CLEAN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CLEAN.functionParameter.number1.name',
                detail: 'formula.functionList.CLEAN.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CLEAN.functionParameter.number2.name',
                detail: 'formula.functionList.CLEAN.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CODE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CODE.description',
        abstract: 'formula.functionList.CODE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CODE.functionParameter.number1.name',
                detail: 'formula.functionList.CODE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CODE.functionParameter.number2.name',
                detail: 'formula.functionList.CODE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CONCAT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CONCAT.description',
        abstract: 'formula.functionList.CONCAT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CONCAT.functionParameter.number1.name',
                detail: 'formula.functionList.CONCAT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CONCAT.functionParameter.number2.name',
                detail: 'formula.functionList.CONCAT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CONCATENATE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CONCATENATE.description',
        abstract: 'formula.functionList.CONCATENATE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CONCATENATE.functionParameter.text1.name',
                detail: 'formula.functionList.CONCATENATE.functionParameter.text1.detail',
                example: 'A1',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CONCATENATE.functionParameter.text2.name',
                detail: 'formula.functionList.CONCATENATE.functionParameter.text2.detail',
                example: 'A2',
                require: 0,
                repeat: 1,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.DBCS,
        functionType: FunctionType.Text,
        description: 'formula.functionList.DBCS.description',
        abstract: 'formula.functionList.DBCS.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DBCS.functionParameter.number1.name',
                detail: 'formula.functionList.DBCS.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DBCS.functionParameter.number2.name',
                detail: 'formula.functionList.DBCS.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.DOLLAR,
        functionType: FunctionType.Text,
        description: 'formula.functionList.DOLLAR.description',
        abstract: 'formula.functionList.DOLLAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.DOLLAR.functionParameter.number1.name',
                detail: 'formula.functionList.DOLLAR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.DOLLAR.functionParameter.number2.name',
                detail: 'formula.functionList.DOLLAR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.EXACT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.EXACT.description',
        abstract: 'formula.functionList.EXACT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EXACT.functionParameter.number1.name',
                detail: 'formula.functionList.EXACT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EXACT.functionParameter.number2.name',
                detail: 'formula.functionList.EXACT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.FIND,
        functionType: FunctionType.Text,
        description: 'formula.functionList.FIND.description',
        abstract: 'formula.functionList.FIND.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FIND.functionParameter.number1.name',
                detail: 'formula.functionList.FIND.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FIND.functionParameter.number2.name',
                detail: 'formula.functionList.FIND.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.FINDB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.FINDB.description',
        abstract: 'formula.functionList.FINDB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FINDB.functionParameter.number1.name',
                detail: 'formula.functionList.FINDB.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FINDB.functionParameter.number2.name',
                detail: 'formula.functionList.FINDB.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.FIXED,
        functionType: FunctionType.Text,
        description: 'formula.functionList.FIXED.description',
        abstract: 'formula.functionList.FIXED.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.FIXED.functionParameter.number1.name',
                detail: 'formula.functionList.FIXED.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.FIXED.functionParameter.number2.name',
                detail: 'formula.functionList.FIXED.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.LEFT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.LEFT.description',
        abstract: 'formula.functionList.LEFT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LEFT.functionParameter.number1.name',
                detail: 'formula.functionList.LEFT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LEFT.functionParameter.number2.name',
                detail: 'formula.functionList.LEFT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.LEFTB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.LEFTB.description',
        abstract: 'formula.functionList.LEFTB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LEFT.functionParameter.text.name',
                detail: 'formula.functionList.LEFT.functionParameter.text.detail',
                example: '"Hello Univer"',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.LEFT.functionParameter.numBytes.name',
                detail: 'formula.functionList.LEFT.functionParameter.numBytes.detail',
                example: '1',
                require: 0,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.LEN,
        functionType: FunctionType.Text,
        description: 'formula.functionList.LEN.description',
        abstract: 'formula.functionList.LEN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LEN.functionParameter.text.name',
                detail: 'formula.functionList.LEN.functionParameter.text.detail',
                example: '"Univer"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.LENB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.LENB.description',
        abstract: 'formula.functionList.LENB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LENB.functionParameter.text.name',
                detail: 'formula.functionList.LENB.functionParameter.text.detail',
                example: '"Univer"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.LOWER,
        functionType: FunctionType.Text,
        description: 'formula.functionList.LOWER.description',
        abstract: 'formula.functionList.LOWER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.LOWER.functionParameter.text.name',
                detail: 'formula.functionList.LOWER.functionParameter.text.detail',
                example: '"Univer"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.MID,
        functionType: FunctionType.Text,
        description: 'formula.functionList.MID.description',
        abstract: 'formula.functionList.MID.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MID.functionParameter.number1.name',
                detail: 'formula.functionList.MID.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MID.functionParameter.number2.name',
                detail: 'formula.functionList.MID.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.MIDB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.MIDB.description',
        abstract: 'formula.functionList.MIDB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.MIDB.functionParameter.number1.name',
                detail: 'formula.functionList.MIDB.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.MIDB.functionParameter.number2.name',
                detail: 'formula.functionList.MIDB.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.NUMBERVALUE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.NUMBERVALUE.description',
        abstract: 'formula.functionList.NUMBERVALUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.NUMBERVALUE.functionParameter.number1.name',
                detail: 'formula.functionList.NUMBERVALUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.NUMBERVALUE.functionParameter.number2.name',
                detail: 'formula.functionList.NUMBERVALUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.PHONETIC,
        functionType: FunctionType.Text,
        description: 'formula.functionList.PHONETIC.description',
        abstract: 'formula.functionList.PHONETIC.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.PHONETIC.functionParameter.number1.name',
                detail: 'formula.functionList.PHONETIC.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.PHONETIC.functionParameter.number2.name',
                detail: 'formula.functionList.PHONETIC.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.PROPER,
        functionType: FunctionType.Text,
        description: 'formula.functionList.PROPER.description',
        abstract: 'formula.functionList.PROPER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.PROPER.functionParameter.number1.name',
                detail: 'formula.functionList.PROPER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.PROPER.functionParameter.number2.name',
                detail: 'formula.functionList.PROPER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.REPLACE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.REPLACE.description',
        abstract: 'formula.functionList.REPLACE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.REPLACE.functionParameter.number1.name',
                detail: 'formula.functionList.REPLACE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REPLACE.functionParameter.number2.name',
                detail: 'formula.functionList.REPLACE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.REPLACEB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.REPLACEB.description',
        abstract: 'formula.functionList.REPLACEB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.REPLACEB.functionParameter.number1.name',
                detail: 'formula.functionList.REPLACEB.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REPLACEB.functionParameter.number2.name',
                detail: 'formula.functionList.REPLACEB.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.REPT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.REPT.description',
        abstract: 'formula.functionList.REPT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.REPT.functionParameter.number1.name',
                detail: 'formula.functionList.REPT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REPT.functionParameter.number2.name',
                detail: 'formula.functionList.REPT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.RIGHT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.RIGHT.description',
        abstract: 'formula.functionList.RIGHT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.RIGHT.functionParameter.number1.name',
                detail: 'formula.functionList.RIGHT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.RIGHT.functionParameter.number2.name',
                detail: 'formula.functionList.RIGHT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.RIGHTB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.RIGHTB.description',
        abstract: 'formula.functionList.RIGHTB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.RIGHTB.functionParameter.number1.name',
                detail: 'formula.functionList.RIGHTB.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.RIGHTB.functionParameter.number2.name',
                detail: 'formula.functionList.RIGHTB.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.SEARCH,
        functionType: FunctionType.Text,
        description: 'formula.functionList.SEARCH.description',
        abstract: 'formula.functionList.SEARCH.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SEARCH.functionParameter.number1.name',
                detail: 'formula.functionList.SEARCH.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SEARCH.functionParameter.number2.name',
                detail: 'formula.functionList.SEARCH.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.SEARCHB,
        functionType: FunctionType.Text,
        description: 'formula.functionList.SEARCHB.description',
        abstract: 'formula.functionList.SEARCHB.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SEARCHB.functionParameter.number1.name',
                detail: 'formula.functionList.SEARCHB.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SEARCHB.functionParameter.number2.name',
                detail: 'formula.functionList.SEARCHB.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.SUBSTITUTE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.SUBSTITUTE.description',
        abstract: 'formula.functionList.SUBSTITUTE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.SUBSTITUTE.functionParameter.number1.name',
                detail: 'formula.functionList.SUBSTITUTE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.SUBSTITUTE.functionParameter.number2.name',
                detail: 'formula.functionList.SUBSTITUTE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.T,
        functionType: FunctionType.Text,
        description: 'formula.functionList.T.description',
        abstract: 'formula.functionList.T.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.T.functionParameter.number1.name',
                detail: 'formula.functionList.T.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.T.functionParameter.number2.name',
                detail: 'formula.functionList.T.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TEXT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TEXT.description',
        abstract: 'formula.functionList.TEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TEXT.functionParameter.value.name',
                detail: 'formula.functionList.TEXT.functionParameter.value.detail',
                example: '1.23',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TEXT.functionParameter.formatText.name',
                detail: 'formula.functionList.TEXT.functionParameter.formatText.detail',
                example: '"$0.00"',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TEXTAFTER,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TEXTAFTER.description',
        abstract: 'formula.functionList.TEXTAFTER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TEXTAFTER.functionParameter.number1.name',
                detail: 'formula.functionList.TEXTAFTER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TEXTAFTER.functionParameter.number2.name',
                detail: 'formula.functionList.TEXTAFTER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TEXTBEFORE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TEXTBEFORE.description',
        abstract: 'formula.functionList.TEXTBEFORE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TEXTBEFORE.functionParameter.number1.name',
                detail: 'formula.functionList.TEXTBEFORE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TEXTBEFORE.functionParameter.number2.name',
                detail: 'formula.functionList.TEXTBEFORE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TEXTJOIN,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TEXTJOIN.description',
        abstract: 'formula.functionList.TEXTJOIN.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TEXTJOIN.functionParameter.number1.name',
                detail: 'formula.functionList.TEXTJOIN.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TEXTJOIN.functionParameter.number2.name',
                detail: 'formula.functionList.TEXTJOIN.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TEXTSPLIT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TEXTSPLIT.description',
        abstract: 'formula.functionList.TEXTSPLIT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TEXTSPLIT.functionParameter.number1.name',
                detail: 'formula.functionList.TEXTSPLIT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TEXTSPLIT.functionParameter.number2.name',
                detail: 'formula.functionList.TEXTSPLIT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.TRIM,
        functionType: FunctionType.Text,
        description: 'formula.functionList.TRIM.description',
        abstract: 'formula.functionList.TRIM.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.TRIM.functionParameter.number1.name',
                detail: 'formula.functionList.TRIM.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.TRIM.functionParameter.number2.name',
                detail: 'formula.functionList.TRIM.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.UNICHAR,
        functionType: FunctionType.Text,
        description: 'formula.functionList.UNICHAR.description',
        abstract: 'formula.functionList.UNICHAR.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.UNICHAR.functionParameter.number1.name',
                detail: 'formula.functionList.UNICHAR.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.UNICHAR.functionParameter.number2.name',
                detail: 'formula.functionList.UNICHAR.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.UNICODE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.UNICODE.description',
        abstract: 'formula.functionList.UNICODE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.UNICODE.functionParameter.number1.name',
                detail: 'formula.functionList.UNICODE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.UNICODE.functionParameter.number2.name',
                detail: 'formula.functionList.UNICODE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.UPPER,
        functionType: FunctionType.Text,
        description: 'formula.functionList.UPPER.description',
        abstract: 'formula.functionList.UPPER.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.UPPER.functionParameter.number1.name',
                detail: 'formula.functionList.UPPER.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.UPPER.functionParameter.number2.name',
                detail: 'formula.functionList.UPPER.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.VALUE,
        functionType: FunctionType.Text,
        description: 'formula.functionList.VALUE.description',
        abstract: 'formula.functionList.VALUE.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VALUE.functionParameter.number1.name',
                detail: 'formula.functionList.VALUE.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VALUE.functionParameter.number2.name',
                detail: 'formula.functionList.VALUE.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.VALUETOTEXT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.VALUETOTEXT.description',
        abstract: 'formula.functionList.VALUETOTEXT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.VALUETOTEXT.functionParameter.number1.name',
                detail: 'formula.functionList.VALUETOTEXT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.VALUETOTEXT.functionParameter.number2.name',
                detail: 'formula.functionList.VALUETOTEXT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.CALL,
        functionType: FunctionType.Text,
        description: 'formula.functionList.CALL.description',
        abstract: 'formula.functionList.CALL.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.CALL.functionParameter.number1.name',
                detail: 'formula.functionList.CALL.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.CALL.functionParameter.number2.name',
                detail: 'formula.functionList.CALL.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.EUROCONVERT,
        functionType: FunctionType.Text,
        description: 'formula.functionList.EUROCONVERT.description',
        abstract: 'formula.functionList.EUROCONVERT.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.EUROCONVERT.functionParameter.number1.name',
                detail: 'formula.functionList.EUROCONVERT.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.EUROCONVERT.functionParameter.number2.name',
                detail: 'formula.functionList.EUROCONVERT.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
    {
        functionName: FUNCTION_NAMES_TEXT.REGISTER_ID,
        functionType: FunctionType.Text,
        description: 'formula.functionList.REGISTER_ID.description',
        abstract: 'formula.functionList.REGISTER_ID.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.REGISTER_ID.functionParameter.number1.name',
                detail: 'formula.functionList.REGISTER_ID.functionParameter.number1.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.REGISTER_ID.functionParameter.number2.name',
                detail: 'formula.functionList.REGISTER_ID.functionParameter.number2.detail',
                example: 'A1:A20',
                require: 1,
                repeat: 0,
            },
        ],
    },
];
