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

import React from 'react';
import type { Preview } from '@storybook/react';
import { defaultTheme, greenTheme, themeInstance } from '@univerjs/design';

export const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme,
};

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },

    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'default',
            toolbar: {
                icon: 'cog',
                items: Object.keys(themes),
                showName: true,
            },
        },
    },

    decorators: [(Story, context) => {
        themeInstance.setTheme(document.body, themes[context.globals.theme]);

        return (
            <Story />
        );
    }],
};

export default preview;
