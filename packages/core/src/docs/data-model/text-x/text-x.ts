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
import type { UpdateDocsAttributeType } from '../../../shared/command-enum';
import type { IDocumentBody } from '../../../types/interfaces/i-document-data';
import { ActionType, type IDeleteAction, type IInsertAction, type IRetainAction, type TextXAction } from '../action-types';
import { ActionIterator } from './action-iterator';
import { composeBody } from './utils';

export class TextX {
    static compose(thisActions: TextXAction[], otherActions: TextXAction[]): TextXAction[] {
        const thisIter = new ActionIterator(thisActions);
        const otherIter = new ActionIterator(otherActions);

        const textX = new TextX();

        while (thisIter.hasNext() || otherIter.hasNext()) {
            if (otherIter.peekType() === ActionType.INSERT) {
                textX.push(otherIter.next());
            } else if (thisIter.peekType() === ActionType.DELETE) {
                textX.push(thisIter.next());
            } else {
                const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
                const thisAction = thisIter.next(length);
                const otherAction = otherIter.next(length);

                if (thisAction.t === ActionType.INSERT && otherAction.t === ActionType.RETAIN) {
                    if (otherAction.body == null) {
                        textX.push(thisAction);
                    } else {
                        textX.push({
                            ...thisAction,
                            body: composeBody(thisAction.body, otherAction.body, otherAction.coverType),
                        });
                    }
                } else if (thisAction.t === ActionType.RETAIN && otherAction.t === ActionType.RETAIN) {
                    if (thisAction.body == null && otherAction.body == null) {
                        textX.push(thisAction); // or otherAction
                    } else if (thisAction.body && otherAction.body) {
                        textX.push({
                            ...thisAction,
                            body: composeBody(thisAction.body, otherAction.body, otherAction.coverType),
                        });
                    } else {
                        textX.push(thisAction.body ? thisAction : otherAction);
                    }
                } else if (thisAction.t === ActionType.RETAIN && otherAction.t === ActionType.DELETE) {
                    textX.push(otherAction);
                } else if (thisAction.t === ActionType.INSERT && otherAction.t === ActionType.DELETE) {
                    // Nothing need to do, they are just cancel off.
                } else {
                    throw new Error('unknown compose case');
                }
            }
        }

        textX.trimEndUselessRetainAction();

        return textX.serialize();
    }

    private _actions: TextXAction[] = [];

    insert(len: number, body: IDocumentBody, segmentId: string): this {
        const insertAction: IInsertAction = {
            t: ActionType.INSERT,
            body,
            len,
            line: 0, // hardcode
            segmentId,
        };

        this.push(insertAction);

        return this;
    }

    retain(len: number, segmentId: string, body?: IDocumentBody, coverType?: UpdateDocsAttributeType): this {
        const retainAction: IRetainAction = {
            t: ActionType.RETAIN,
            len,
            segmentId,
        };

        if (body != null) {
            retainAction.body = body;
        }

        if (coverType != null) {
            retainAction.coverType = coverType;
        }

        this.push(retainAction);

        return this;
    }

    delete(len: number, segmentId: string): this {
        const deleteAction: IDeleteAction = {
            t: ActionType.DELETE,
            len,
            line: 0, // hardcode
            segmentId,
        };

        this.push(deleteAction);

        return this;
    }

    serialize(): TextXAction[] {
        return this._actions;
    }

    push(...args: TextXAction[]): this {
        if (args.length > 1) {
            for (const ac of args) {
                this.push(ac);
            }

            return this;
        }

        let index = this._actions.length;
        let lastAction = this._actions[index - 1];

        const newAction = Tools.deepClone(args[0]);

        if (typeof lastAction === 'object') {
            // if lastAction and newAction are both delete action, merge the two actions and return this.
            if (lastAction.t === ActionType.DELETE && newAction.t === ActionType.DELETE) {
                lastAction.len += newAction.len;

                return this;
            }

            // Since it does not matter if we insert before or after deleting at the same index,
            // always prefer to insert first
            if (lastAction.t === ActionType.DELETE && newAction.t === ActionType.INSERT) {
                index -= 1;
                lastAction = this._actions[index - 1];

                if (lastAction == null) {
                    this._actions.unshift(newAction);

                    return this;
                }
            }

            // if lastAction and newAction are both retain action and has no body, merge the two actions and return this.
            if (lastAction.t === ActionType.RETAIN && newAction.t === ActionType.RETAIN && lastAction.body == null && newAction.body == null) {
                lastAction.len += newAction.len;

                return this;
            }
        }

        if (index === this._actions.length) {
            this._actions.push(newAction);
        } else {
            this._actions.splice(index, 0, newAction);
        }

        return this;
    }

    trimEndUselessRetainAction(): this {
        let lastAction = this._actions[this._actions.length - 1];

        while (lastAction.t === ActionType.RETAIN && lastAction.body == null) {
            this._actions.pop();

            lastAction = this._actions[this._actions.length - 1];
        }

        return this;
    }
}
