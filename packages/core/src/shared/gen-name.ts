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

export class GenName {
    private _include: string[];

    private _count: number;

    constructor() {
        this._include = [];
        this._count = 1;
    }

    checkName(name: string): boolean {
        return this._include.includes(name);
    }

    addName(name: string = 'sheet'): string {
        let output = name;
        while (this.checkName(output)) {
            output = name + this._count;
            this._count++;
        }
        this._include.push(output);
        return output;
    }
}
