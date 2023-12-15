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

import { PageElementType } from '@univerjs/core';

import { DEFAULT_LIST_TEST } from '../../docs/default-list';

export const PAGE3_RICHTEXT_1 = {
    id: 'detailContent1',
    zIndex: 3,
    left: 53,
    top: 363,
    width: 273,
    height: 54,
    title: 'detailContent1',
    description: '',
    type: PageElementType.TEXT,
    richText: {
        rich: {
            id: 'd',
            lists: DEFAULT_LIST_TEST,
            body: {
                dataStream: `Digital Immune System\rApplied Observability\r\n`,
                textRuns: [
                    {
                        st: 0,
                        ed: 20,
                        ts: {
                            fs: 12,
                        },
                    },
                    {
                        st: 22,
                        ed: 42,
                        ts: {
                            fs: 12,
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 21,
                        bullet: {
                            listId: 'orderList',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
                            },
                        },
                        paragraphStyle: {
                            spaceBelow: 15,
                        },
                    },
                    {
                        startIndex: 43,
                        bullet: {
                            listId: 'orderList',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
                            },
                        },
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: undefined,
                    height: undefined,
                },
                marginTop: 2,
                marginBottom: 2,
                marginRight: 0,
                marginLeft: 0,
            },
        },
    },
};
