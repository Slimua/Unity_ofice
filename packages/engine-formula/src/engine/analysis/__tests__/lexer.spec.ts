import type { IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { LocaleType } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IDefinedNamesService } from '../../../services/defined-names.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { Lexer } from '../lexer';
import type { LexerNode } from '../lexer-node';
import { LexerTreeBuilder } from '../lexer-tree-builder';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('lexer nodeMaker test', () => {
    let univer: Univer;
    let lexer: Lexer;
    let get: Injector['get'];
    let workbook: Workbook;
    let definedNamesService: IDefinedNamesService;
    let runtimeService: IFormulaRuntimeService;
    let lexerTreeBuilder: LexerTreeBuilder;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA);
        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        definedNamesService = get(IDefinedNamesService);

        runtimeService = get(IFormulaRuntimeService);

        lexerTreeBuilder = get(LexerTreeBuilder);

        runtimeService.setCurrent(0, 0, 'sheet1', 'test');

        lexer = new Lexer(definedNamesService, runtimeService, lexerTreeBuilder);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('lexer definedName', () => {
        it('simple', () => {
            definedNamesService.registerDefinedName('test', 'myName', '$A$10:$C$100');

            const node = lexer.treeBuilder(`=myName`) as LexerNode;

            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"$A$10","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"$C$100","st":-1,"ed":-1,"children":[]}]}]}]}`
            );
        });

        it('lambda', () => {
            definedNamesService.registerDefinedName('test', 'myName', 'lambda(x, y , x*x*y)');

            const node = lexer.treeBuilder(`=myName(1+sum(A1:B1), 100)`) as LexerNode;

            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":0,"ed":5,"children":[{"token":"L_1","st":16,"ed":18,"children":[{"token":"P_1","st":17,"ed":19,"children":["1",{"token":"sum","st":23,"ed":25,"children":[{"token":"P_1","st":23,"ed":25,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]}]}]}]},"+"]},{"token":"P_1","st":30,"ed":32,"children":[" 100"]}]},{"token":"P_1","st":3,"ed":5,"children":["x"]},{"token":"P_1","st":5,"ed":7,"children":[" y "]},{"token":"P_1","st":9,"ed":11,"children":[" x","x","y","*","*"]}]}]}`
            );
        });
    });
});
