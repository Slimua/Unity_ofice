/* eslint-disable no-magic-numbers */

import {
    BooleanNumber,
    ICommand,
    ICommandService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RichTextEditingMutation } from '../../mutations/core-editing.mutation';
import { SetInlineFormatCommand } from '../inline-format.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test inline format commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getFormatValueAt(key: 'bl', pos: number) {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUniverDocInstance('test-doc');

        if (docsModel?.body?.textRuns == null) {
            return null;
        }

        for (const textRun of docsModel.body?.textRuns) {
            const { st, ed, ts = {} } = textRun;

            if (st <= pos && ed >= pos) {
                return ts[key] ?? null;
            }
        }

        return null;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        // commandService.registerCommand(SetInlineFormatBoldCommand);
        commandService.registerCommand(SetInlineFormatCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        // const selectionManager = get(TextSelectionManagerService);

        // selectionManager.setCurrentSelection({
        //     pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
        //     unitId: 'test-doc',
        // });

        // selectionManager.add([
        //     {
        //         cursorStart: 0,
        //         isStartBack: true,
        //         cursorEnd: 5,
        //         isEndBack: false,
        //         isCollapse: false,
        //         segmentId: '',
        //     },
        // ]);
    });

    afterEach(() => univer.dispose());

    describe('Set Bold by SetInlineFormatBoldCommand', () => {
        it('Should change text in range(0, 5) to bold', async () => {
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);

            const doMutation = {
                unitId: 'test-doc',
                doMutation: {
                    id: 'doc.mutation.rich-text-editing',
                    params: {
                        unitId: 'test-doc',
                        mutations: [
                            {
                                t: 'r',
                                body: {
                                    dataStream: '',
                                    textRuns: [
                                        {
                                            st: 0,
                                            ed: 5,
                                            ts: {
                                                bl: BooleanNumber.TRUE,
                                            },
                                        },
                                    ],
                                },
                                len: 5,
                                segmentId: '',
                            },
                        ],
                    },
                },
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, doMutation);

            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
        });
    });
});
