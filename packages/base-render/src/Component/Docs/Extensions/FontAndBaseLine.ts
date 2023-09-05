import { BaselineOffset, getColorStyle, IScale } from '@univerjs/core';
import { DocumentsSpanAndLineExtensionRegistry } from '../../Extension';
import { docExtension } from '../DocExtension';
import { IDocumentSkeletonSpan } from '../../../Basics/IDocumentSkeletonCached';
import { COLOR_BLACK_RGB } from '../../../Basics/Const';
import { Vector2 } from '../../../Basics/Vector2';

const UNIQUE_KEY = 'DefaultDocsFontAndBaseLineExtension';

export class FontAndBaseLine extends docExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 20;

    private _preFontString = '';

    private _preFontColor = '';

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { asc = 0, marginTop: lineMarginTop = 0, paddingTop: linePaddingTop = 0 } = line;
        const maxLineAsc = asc + lineMarginTop + linePaddingTop;
        const { ts: textStyle, content, fontStyle, bBox } = span;
        const { spanPointWithFont = Vector2.create(0, 0) } = this.extensionOffset;
        if (!textStyle) {
            if (content != null) {
                ctx.fillText(content, spanPointWithFont.x, spanPointWithFont.y);
            }

            return;
        }

        if (content == null) {
            return;
        }

        if (this._preFontString !== fontStyle?.fontString) {
            ctx.font = this._preFontString = fontStyle?.fontString || '';
        }

        const { cl: colorStyle, va: baselineOffset } = textStyle;
        const fontColor = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

        if (fontColor && this._preFontColor !== fontColor) {
            ctx.fillStyle = fontColor;
        }

        if (baselineOffset === BaselineOffset.SUBSCRIPT || baselineOffset === BaselineOffset.SUPERSCRIPT) {
            // const { renderConfig = {} } = this.extensionOffset;

            // const { centerAngle = 0 } = renderConfig;

            let offset = bBox.spo;
            if (baselineOffset === BaselineOffset.SUPERSCRIPT) {
                offset = -bBox.sbo;
            }

            // const offsetSin = offset * Math.sin(centerAngle);
            // const offsetCos = offset * Math.cos(centerAngle);

            spanPointWithFont.y += offset;

            // spanPointWithFont = calculateRectRotate(originTranslate.addByPoint(span.left + offsetSin, offsetCos), centerPoint, centerAngle, vertexAngle, alignOffset);
        }

        // console.log(content, spanPointWithFont.x, spanPointWithFont.y, startX, startY);

        ctx.fillText(content, spanPointWithFont.x, spanPointWithFont.y);
    }

    override clearCache() {
        this._preFontString = '';
        this._preFontColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new FontAndBaseLine());
