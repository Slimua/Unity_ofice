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

import type { UniverRenderingContext2D } from '@univerjs/engine-render';
import { Checkbox, fixLineWidthByScale, Transform } from '@univerjs/engine-render';
import { ICommandService, isFormulaString } from '@univerjs/core';
import type { ICellCustomRender, ICellRenderContext, IDataValidationRule, ISelectionCellWithCoord, IStyleData, Nullable } from '@univerjs/core';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { IFormulaResult } from '@univerjs/data-validation';
import { Inject } from '@wendellhu/redi';
import type { ISetRangeValuesCommandParams } from '../../../sheets/lib/types';
import { CHECKBOX_FORMULA_1, CHECKBOX_FORMULA_2 } from '../validators/checkbox-validator';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult } from '../utils/formula';
import { getCellValueOrigin } from '../utils/getCellDataOrigin';

export class CheckboxRender implements ICellCustomRender {
    private _calc(cellInfo: ISelectionCellWithCoord, style: Nullable<IStyleData>) {
        return {
            left: cellInfo.startX,
            top: cellInfo.startY,
            width: (style?.fs ?? 10) * 1.6,
            height: (style?.fs ?? 10) * 1.6,
        };
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DataValidationFormulaService) private readonly _formulaService: DataValidationFormulaService
    ) {}

    private async _parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult> {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1,
            formula2: isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2,
        };
    }

    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext): void {
        const { style, data, primaryWithCoord } = info;
        const value = getCellValueOrigin(data);
        const rule = data.dataValidation?.rule;
        if (!rule) {
            return;
        }

        const { formula1 = CHECKBOX_FORMULA_1 } = rule;

        const layout = this._calc(primaryWithCoord, style);
        const { a: scaleX, d: scaleY } = ctx.getTransform();
        const left = fixLineWidthByScale(layout.left, scaleX);
        const top = fixLineWidthByScale(layout.top, scaleY);

        const transform = Transform.create().composeMatrix({
            left,
            top,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            skewX: 0,
            skewY: 0,
            flipX: false,
            flipY: false,
        });

        const m = transform.getMatrix();
        ctx.save();

        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

        Checkbox.drawWith(ctx, {
            checked: value === formula1,
            left: primaryWithCoord.startX,
            top: primaryWithCoord.startY,
            width: (style?.fs ?? 10) * 1.6,
            fill: style?.cl?.rgb ?? '#000',
        });

        ctx.restore();
    }

    isHit(evt: { x: number;y: number }, info: ICellRenderContext): boolean {
        const layout = this._calc(info.primaryWithCoord, info.style);
        const startY = layout.top;
        const endY = layout.top + layout.height;
        const startX = layout.left;
        const endX = layout.left + layout.width;
        const { x: offsetX, y: offsetY } = evt;
        if (offsetX <= endX && offsetX >= startX && offsetY <= endY && offsetY >= startY) {
            return true;
        }

        return false;
    }

    async onPointerDown(info: ICellRenderContext) {
        const { primaryWithCoord, unitId, subUnitId, data } = info;
        const value = getCellValueOrigin(data);
        const rule = data.dataValidation?.rule;
        if (!rule) {
            return;
        }
        const { formula1, formula2 } = await this._parseFormula(rule, unitId!, subUnitId);

        const params: ISetRangeValuesCommandParams = {
            range: {
                startColumn: primaryWithCoord.actualColumn,
                endColumn: primaryWithCoord.actualColumn,
                startRow: primaryWithCoord.actualRow,
                endRow: primaryWithCoord.actualRow,
            },
            value: {
                v: value === formula1 ? formula2 : formula1,
            },
        };

        this._commandService.executeCommand(
            SetRangeValuesCommand.id,
            params
        );
    };
}
