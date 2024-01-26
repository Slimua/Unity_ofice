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
import { ActionIterator } from '../action-iterator';
import { ActionType } from '../../action-types';
import { BooleanNumber } from '../../../../types/enum/text-style';

describe('Test action iterator', () => {
    it('test action iterator basic use', () => {
        const iterator = new ActionIterator([{
            t: ActionType.RETAIN,
            len: 5,
        }, {
            t: ActionType.INSERT,
            body: {
                dataStream: 'hello',
                textRuns: [{
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 5,
            line: 0,
        }, {
            t: ActionType.DELETE,
            len: 5,
            line: 0,
        }]);

        expect(iterator.hasNext()).toBe(true);

        expect(iterator.peekType()).toBe(ActionType.RETAIN);

        expect(iterator.peekLength()).toBe(5);

        expect(iterator.peek()).toEqual({
            t: ActionType.RETAIN,
            len: 5,
        });

        let action = iterator.next();

        expect(action).toEqual({
            t: ActionType.RETAIN,
            len: 5,
        });

        expect(iterator.peekType()).toBe(ActionType.INSERT);

        action = iterator.next(2);

        expect(action).toEqual({
            t: ActionType.INSERT,
            body: {
                dataStream: 'he',
                textRuns: [{
                    st: 0,
                    ed: 2,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 2,
            line: 0,
        });

        expect(iterator.peekType()).toBe(ActionType.INSERT);

        action = iterator.next(4);

        expect(action).toEqual({
            t: ActionType.INSERT,
            body: {
                dataStream: 'llo',
                textRuns: [{
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 3,
            line: 0,
        });

        expect(iterator.peekType()).toBe(ActionType.DELETE);

        action = iterator.next();

        expect(action).toEqual({
            t: ActionType.DELETE,
            len: 5,
            line: 0,
        });

        expect(iterator.hasNext()).toBe(false);
        expect(iterator.rest()).toEqual([]);
    });
});
