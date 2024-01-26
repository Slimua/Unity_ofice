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

import { Tools } from '../../../shared/tools';
import type { TextXAction } from '../action-types';
import { ActionType } from '../action-types';
import { getBodySlice } from './utils';

function actionLength(action: TextXAction) {
    return action.len;
}

export class ActionIterator {
    private _index = 0;
    private _offset = 0;

    constructor(private _actions: TextXAction[]) {}

    hasNext() {
        return this.peekLength() < Number.POSITIVE_INFINITY;
    }

    next(length?: number): TextXAction {
        if (!length) {
            length = Number.POSITIVE_INFINITY;
        }

        const nextAction = this._actions[this._index];
        if (nextAction) {
            const offset = this._offset;
            const actionLength = nextAction.len;
            if (length >= actionLength - offset) {
                // Return the action if the length is great than action length, and reset offset to 0.
                length = actionLength - offset;
                this._index += 1;
                this._offset = 0;
            } else {
                this._offset += length;
            }

            /**
             * How to deal with it?
             * 1. If it is of the delete type or retain(the body attribute is undefined)
             *    1) Then change the len property and return the deepClone before action
             * 2. If it is a retain, insert type
             *    1) First of all, you need to change the len attribute to `length`
             *    2) Slice the body and slice the range [offset, length]
             *    3) Reassemble the returned action
             */

            if (nextAction.t === ActionType.DELETE || (nextAction.t === ActionType.RETAIN && nextAction.body == null)) {
                return Tools.deepClone({
                    ...nextAction,
                    len: length,
                });
            } else {
                // handle condition: (nextAction.t === ActionType.INSERT || nextAction.t === ActionType.RETAIN && nextAction.body)
                return Tools.deepClone({
                    ...nextAction,
                    len: length,
                    body: getBodySlice(nextAction.body!, offset, offset + length),
                });
            }
        } else {
            // It indicate that the iterator is exhausted when return ActionType.RETAIN and len is positive infinity.
            return {
                t: ActionType.RETAIN,
                len: Number.POSITIVE_INFINITY,
            };
        }
    }

    peek(): TextXAction {
        return this._actions[this._index];
    }

    peekLength() {
        if (this._actions[this._index]) {
            // Should never return 0 if our index is being managed correctly
            return actionLength(this._actions[this._index]) - this._offset;
        } else {
            return Number.POSITIVE_INFINITY;
        }
    }

    peekType(): ActionType {
        const action = this._actions[this._index];
        if (action) {
            if (action.t === ActionType.DELETE) {
                return ActionType.DELETE;
            } else if (action.t === ActionType.RETAIN) {
                return ActionType.RETAIN;
            } else {
                return ActionType.INSERT;
            }
        }

        return ActionType.RETAIN;
    }

    rest(): TextXAction[] {
        if (!this.hasNext()) {
            return [];
        } else if (this._offset === 0) {
            return this._actions.slice(this._index);
        } else {
            const offset = this._offset;
            const index = this._index;
            const next = this.next();
            const rest = this._actions.slice(this._index);
            this._offset = offset;
            this._index = index;

            return [next].concat(rest);
        }
    }
}
