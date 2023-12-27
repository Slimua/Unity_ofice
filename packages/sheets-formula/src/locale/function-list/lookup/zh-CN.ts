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

export default {
    ADDRESS: {
        description:
            '根据指定行号和列号获得工作表中的某个单元格的地址。 例如，ADDRESS(2,3) 返回 $C$2。 再例如，ADDRESS(77,300) 返回 $KN$77。 可以使用其他函数（如 ROW 和 COLUMN 函数）为 ADDRESS 函数提供行号和列号参数。',
        abstract: '以文本形式将引用值返回到工作表的单个单元格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/address-%E5%87%BD%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: { name: '行号', detail: '一个数值，指定要在单元格引用中使用的行号。' },
            column_num: { name: '列号', detail: '一个数值，指定要在单元格引用中使用的列号。' },
            abs_num: { name: '引用类型', detail: '一个数值，指定要返回的引用类型。' },
            a1: {
                name: '引用样式',
                detail: '一个逻辑值，指定 A1 或 R1C1 引用样式。 在 A1 样式中，列和行将分别按字母和数字顺序添加标签。 在 R1C1 引用样式中，列和行均按数字顺序添加标签。 如果参数 A1 为 TRUE 或被省略，则 ADDRESS 函数返回 A1 样式引用；如果为 FALSE，则 ADDRESS 函数返回 R1C1 样式引用。',
            },
            sheet_text: {
                name: '工作表名称',
                detail: '一个文本值，指定要用作外部引用的工作表的名称。 例如，公式=ADDRESS (1，1,,,"Sheet2") 返回 Sheet2！$A$1。 如果 sheet_text 参数，则不使用工作表名称，函数返回的地址引用当前工作表上的单元格。',
            },
        },
    },
    AREAS: {
        description: '返回引用中涉及的区域个数',
        abstract: '返回引用中涉及的区域个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/areas-%E5%87%BD%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSE: {
        description: '从值的列表中选择值',
        abstract: '从值的列表中选择值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/choose-%E5%87%BD%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSECOLS: {
        description: '返回数组中的指定列',
        abstract: '返回数组中的指定列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/choosecols-%E5%87%BD%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHOOSEROWS: {
        description: '返回数组中的指定行',
        abstract: '返回数组中的指定行',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/chooserows-%E5%87%BD%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMN: {
        description: '返回引用的列号',
        abstract: '返回引用的列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/column-%E5%87%BD%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COLUMNS: {
        description: '返回引用中包含的列数',
        abstract: '返回引用中包含的列数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/columns-%E5%87%BD%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DROP: {
        description: '从数组的开头或末尾排除指定数量的行或列',
        abstract: '从数组的开头或末尾排除指定数量的行或列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/drop-%E5%87%BD%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXPAND: {
        description: '将数组展开或填充到指定的行和列维度',
        abstract: '将数组展开或填充到指定的行和列维度',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/expand-%E5%87%BD%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FILTER: {
        description: 'FILTER 函数可以基于定义的条件筛选一系列数据。',
        abstract: 'FILTER 函数可以基于定义的条件筛选一系列数据。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/filter-%E5%87%BD%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORMULATEXT: {
        description: '将给定引用的公式返回为文本',
        abstract: '将给定引用的公式返回为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/formulatext-%E5%87%BD%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    GETPIVOTDATA: {
        description: '返回存储在数据透视表中的数据',
        abstract: '返回存储在数据透视表中的数据',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/getpivotdata-%E5%87%BD%E6%95%B0-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: '查找数组的首行，并返回指定单元格的值',
        abstract: '查找数组的首行，并返回指定单元格的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hlookup-%E5%87%BD%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HSTACK: {
        description: '水平和顺序追加数组以返回较大的数组',
        abstract: '水平和顺序追加数组以返回较大的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hstack-%E5%87%BD%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HYPERLINK: {
        description: '创建快捷方式或跳转，以打开存储在网络服务器、Intranet 或 Internet 上的文档',
        abstract: '创建快捷方式或跳转，以打开存储在网络服务器、Intranet 或 Internet 上的文档',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hyperlink-%E5%87%BD%E6%95%B0-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGE: {
        description: '从给定源返回图像',
        abstract: '从给定源返回图像',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/image-%E5%87%BD%E6%95%B0-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDEX: {
        description: '使用索引从引用或数组中选择值',
        abstract: '使用索引从引用或数组中选择值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/index-%E5%87%BD%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDIRECT: {
        description: '返回由文本值指定的引用',
        abstract: '返回由文本值指定的引用',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LOOKUP: {
        description: '在向量或数组中查找值',
        abstract: '在向量或数组中查找值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lookup-%E5%87%BD%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MATCH: {
        description: '在引用或数组中查找值',
        abstract: '在引用或数组中查找值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/match-%E5%87%BD%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OFFSET: {
        description: '从给定引用中返回引用偏移量',
        abstract: '从给定引用中返回引用偏移量',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/offset-%E5%87%BD%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROW: {
        description: '返回引用的行号',
        abstract: '返回引用的行号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/row-%E5%87%BD%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ROWS: {
        description: '返回引用中的行数',
        abstract: '返回引用中的行数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rows-%E5%87%BD%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RTD: {
        description: '从支持 COM 自动化的程序中检索实时数据',
        abstract: '从支持 COM 自动化的程序中检索实时数据',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rtd-%E5%87%BD%E6%95%B0-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORT: {
        description: '对区域或数组的内容进行排序',
        abstract: '对区域或数组的内容进行排序',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/sort-%E5%87%BD%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORTBY: {
        description: '根据相应区域或数组中的值对区域或数组的内容进行排序',
        abstract: '根据相应区域或数组中的值对区域或数组的内容进行排序',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/sortby-%E5%87%BD%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TAKE: {
        description: '从数组的开头或末尾返回指定数量的连续行或列',
        abstract: '从数组的开头或末尾返回指定数量的连续行或列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/take-%E5%87%BD%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOCOL: {
        description: '返回单个列中的数组',
        abstract: '返回单个列中的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tocol-%E5%87%BD%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TOROW: {
        description: '返回单个行中的数组',
        abstract: '返回单个行中的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/torow-%E5%87%BD%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRANSPOSE: {
        description: '返回数组的转置',
        abstract: '返回数组的转置',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/transpose-%E5%87%BD%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNIQUE: {
        description: '返回列表或区域的唯一值列表',
        abstract: '返回列表或区域的唯一值列表',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/unique-%E5%87%BD%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VLOOKUP: {
        description: '在数组第一列中查找，然后在行之间移动以返回单元格的值',
        abstract: '在数组第一列中查找，然后在行之间移动以返回单元格的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vlookup-%E5%87%BD%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VSTACK: {
        description: '按顺序垂直追加数组以返回更大的数组',
        abstract: '按顺序垂直追加数组以返回更大的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vstack-%E5%87%BD%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPCOLS: {
        description: '在指定数量的元素之后按列包装提供的行或值列',
        abstract: '在指定数量的元素之后按列包装提供的行或值列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wrapcols-%E5%87%BD%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WRAPROWS: {
        description: '在指定数量的元素之后按行包装提供的行或值列',
        abstract: '在指定数量的元素之后按行包装提供的行或值列',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/wraprows-%E5%87%BD%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XLOOKUP: {
        description:
            '搜索区域或数组，并返回与之找到的第一个匹配项对应的项。 如果不存在匹配项，则 XLOOKUP 可返回最接近（近似值）的匹配项。&nbsp;',
        abstract:
            '搜索区域或数组，并返回与之找到的第一个匹配项对应的项。 如果不存在匹配项，则 XLOOKUP 可返回最接近（近似值）的匹配项。&nbsp;',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xlookup-%E5%87%BD%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XMATCH: {
        description: '返回项目在数组或单元格区域中的相对位置。&nbsp;',
        abstract: '返回项目在数组或单元格区域中的相对位置。&nbsp;',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xmatch-%E5%87%BD%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
