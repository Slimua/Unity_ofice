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

/**
 * Border style types
 *
 * @enum
 */
export enum BorderStyleTypes {
    /**
     * No border
     */
    NONE,
    /**
     * Thin border
     */
    THIN,
    /**
     * Hair border
     */
    HAIR,
    /**
     * Dotted border
     */
    DOTTED,
    /**
     * Dashed border
     */
    DASHED,
    /**
     * Dash-dot border
     */
    DASH_DOT,
    /**
     * Dash-dot-dot border
     */
    DASH_DOT_DOT,
    /**
     * Double border
     */
    DOUBLE,
    /**
     * Medium border
     */
    MEDIUM,
    /**
     * Medium dashed border
     */
    MEDIUM_DASHED,
    /**
     * Medium dash-dot border
     */
    MEDIUM_DASH_DOT,
    /**
     * Medium dash-dot-dot border
     */
    MEDIUM_DASH_DOT_DOT,
    /**
     * Slant dash-dot border
     */
    SLANT_DASH_DOT,
    /**
     * Thick border
     */
    THICK,
}

/**
 * Border type
 *
 * @enum
 */
export enum BorderType {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none',
    ALL = 'all',
    OUTSIDE = 'outside',
    INSIDE = 'inside',
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',

    TLBR = 'tlbr',
    TLBC_TLMR = 'tlbc_tlmr',
    TLBR_TLBC_TLMR = 'tlbr_tlbc_tlmr',
    BLTR = 'bl_tr',
    MLTR_BCTR = 'mltr_bctr',
}
