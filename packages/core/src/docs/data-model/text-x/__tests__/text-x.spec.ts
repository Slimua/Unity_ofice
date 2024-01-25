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

import { describe, expect, it } from 'vitest';
import { TextX } from '../text-x';
import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';

describe('test TextX methods and branches', () => {
    describe('test TextX methods', () => {
        it('test TextX insert method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.insert(5, body, '');

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'i',
                    body,
                    len: 5,
                    line: 0,
                    segmentId: '',
                },
            ]);
        });

        it('test TextX delete method', () => {
            const textX = new TextX();

            textX.delete(5, '');

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'd',
                    len: 5,
                    line: 0,
                    segmentId: '',
                },
            ]);
        });

        it('test TextX retain method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
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
            };

            textX.retain(5, '', body, UpdateDocsAttributeType.COVER);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'r',
                    body,
                    len: 5,
                    coverType: UpdateDocsAttributeType.COVER,
                    segmentId: '',
                },
            ]);
        });

        it('test TextX push method and merge two delete actions', () => {
            const textX = new TextX();

            textX.delete(5, '');
            textX.delete(5, '');

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'd',
                    len: 10, // 5 + 5
                    line: 0,
                    segmentId: '',
                },
            ]);
        });

        it('test TextX push method and put insert action before delete action', () => {
            const textX = new TextX();

            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.delete(5, '');
            textX.insert(5, body, '');

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'i',
                    body,
                    len: 5,
                    line: 0,
                    segmentId: '',
                },
                {
                    t: 'd',
                    len: 5,
                    line: 0,
                    segmentId: '',
                },
            ]);
        });

        it('test TextX push method and merge two simple retain action', () => {
            const textX = new TextX();

            textX.retain(4, '');
            textX.retain(5, '');

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: 'r',
                    len: 9,
                    segmentId: '',
                },
            ]);
        });
    });
});
