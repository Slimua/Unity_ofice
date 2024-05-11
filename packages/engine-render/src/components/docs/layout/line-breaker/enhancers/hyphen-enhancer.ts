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

import type { Nullable } from '@univerjs/core';
import { Break, BreakPointType } from '../break';
import type { IBreakPoints, LineBreaker } from '../line-breaker';
import type { Hyphen } from '../../hyphenation/hyphen';
import type { Lang } from '../../hyphenation/lang';

export function isLetter(char: string) {
    return char.length > 0 && !/\s|(?![\'])[\!-\@\[-\`\{-\~\u2013-\u203C]/.test(char);
}

function getWord(str: string): string {
    let word = '';

    for (let i = 0; i < str.length; i++) {
        if (isLetter(str[i])) {
            word += str[i];
        } else {
            break;
        }
    }

    return word;
}

function getHyphenPosition(lastPos: number, hyphenSlice: string[], index: number): number {
    let hyphenPos = lastPos;

    for (let i = 0; i <= index; i++) {
        hyphenPos += hyphenSlice[i].length;
    }

    return hyphenPos;
}

export class LineBreakerHyphenEnhancer implements IBreakPoints {
    private _curBreak: Nullable<Break> = null;

    private _nextBreak: Nullable<Break> = new Break(0);

    private _isInWord = false;

    private _word = '';

    private _hyphenIndex = -1;

    private _hyphenSlice: string[] = [];

    private _content = '';

    constructor(private _lineBreaker: LineBreaker, private _hyphen: Hyphen, private _lang: Lang) {
        this._content = _lineBreaker.content;
    }

    nextBreakPoint(): Nullable<Break> {
        if (!this._isInWord) {
            this._curBreak = this._nextBreak;
            this._nextBreak = this._lineBreaker.nextBreakPoint();

            // If has no next break, return null.
            if (this._nextBreak == null || this._curBreak == null) {
                return null;
            }
            // Check if next break is in word.
            const word = getWord(this._content.slice(this._curBreak.position, this._nextBreak.position));

            if (word.length) {
                this._isInWord = true;
                this._word = word;
                // hyphenation.
                this._hyphenSlice = this._hyphen.hyphenate(this._word, this._lang)!;
                this._hyphenIndex = 0;
                return this.nextBreakPoint();
            } else {
                return this._nextBreak;
            }
        } else {
            // No need to add `-` to last hyphen slice, so use length - 1.
            if (this._hyphenIndex < this._hyphenSlice.length - 1) {
                const position = getHyphenPosition(this._curBreak!.position, this._hyphenSlice, this._hyphenIndex);

                this._hyphenIndex++;

                return new Break(position, BreakPointType.Hyphen);
            } else {
                this._isInWord = false;
                this._word = '';
                this._hyphenSlice = [];
                this._hyphenIndex = -1;

                return this._nextBreak;
            }
        }
    }
}
