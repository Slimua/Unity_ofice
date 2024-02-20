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

import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { Lexer } from '../../../../engine/analysis/lexer';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Row } from '..';
import type { BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import type { ArrayValueObject } from '../../../..';

describe('Test row', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;

    beforeEach(() => {
        const testBed = createFunctionTestBed();

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        formulaCurrentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            forceCalculate: false,
            numfmtItemMap: {},
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyUnitFeatureMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        functionService.registerExecutors(
            new Row(FUNCTION_NAMES_LOOKUP.ROW)
        );
    });

    describe('Row', () => {
        it('No reference', async () => {
            const lexerNode = lexer.treeBuilder('=ROW()');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });
        it('Reference single cell', async () => {
            const lexerNode = lexer.treeBuilder('=ROW(A5)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as ArrayValueObject).toValue()).toStrictEqual([[5]]);
        });
        it('Reference array cell', async () => {
            const lexerNode = lexer.treeBuilder('=ROW(A5:B10)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as ArrayValueObject).toValue()).toStrictEqual([[5], [6], [7], [8], [9], [10]]);
        });
        it('Illegal parameters', async () => {
            const lexerNode = lexer.treeBuilder('=ROW("A5")');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as ErrorValueObject).isError()).toBeTruthy();
        });
    });
});
