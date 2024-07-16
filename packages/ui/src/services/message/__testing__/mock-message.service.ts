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

import type { IMessageOptions, IMessageProps } from '@univerjs/design';
import type { IDisposable } from '@wendellhu/redi';

import { toDisposable } from '@univerjs/core';
import type { IMessageService } from '../message.service';

/**
 * This is a mocked message service for testing purposes.
 */
export class MockMessageService implements IMessageService {
    show(_options: IMessageOptions & Omit<IMessageProps, 'key'>): IDisposable {
        return toDisposable(() => { /* empty */ });
    }

    setContainer(): void {
        // empty
    }

    getContainer(): HTMLElement | undefined {
        return undefined;
    }
}
