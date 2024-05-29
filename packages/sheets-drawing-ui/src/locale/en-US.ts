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

const locale = {
    sheetImage: {
        title: 'Image',

        upload: {
            float: 'Float Image',
            cell: 'Cell Image',
        },

        panel: {
            title: 'Edit Image',
        },
    },
    'image-popup': {
        replace: 'Replace',
        delete: 'Delete',
        edit: 'Edit',
        crop: 'Crop',
        reset: 'Reset Size',
    },
    'drawing-anchor': {
        title: 'Anchor Properties',
        both: 'Move and size with cells',
        position: "Move but don't size with cells",
        none: "Don't move or size with cells",
    },
    'update-status': {
        exceedMaxSize: 'Image size exceeds limit, limit is 5M',
        invalidImageType: 'Invalid image type',
        exceedMaxCount: 'The number of images exceeds the limit, the limit is {0}',
        invalidImage: 'Invalid image',
    },
};

export default locale;
