import { IRectProps, Rect } from '@univerjs/base-render';
import { Random } from '@univerjs/core';

export interface EditTooltipsProps extends IRectProps {
    textSize?: number;
    text?: string;
    borderColor?: string;
}

const colors = ['#c91c1c', '#621cc9', '#1c28c9', '#1c7bc9', '#1c7bc9', '#1cc94a', '#afc91c', '#c9841c', '#c94a1c'];
const random = new Random(0, colors.length - 1);

export class EditTooltips extends Rect<EditTooltipsProps> {
    textSize?: number;

    text?: string;

    translateTop: number;

    translateLeft: number;

    constructor(key?: string, props?: EditTooltipsProps) {
        props = {
            ...{
                stroke: colors[random.next()],
                strokeWidth: 2,
            },
            ...props,
        };
        super(key, props);
        this.textSize = props?.textSize ?? 15;
        this.text = props?.text ?? 'User';
        this.translateTop = 0;
        this.translateLeft = 0;
    }

    static override drawWith(ctx: CanvasRenderingContext2D, props: EditTooltips): void {
        if (props.text) {
            ctx.font = `${props.textSize}px Arial`;
            const metrics = ctx.measureText(props.text);
            const padding = 10;

            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;

            const rectTop = -textHeight - padding;
            const rectLeft = props.width - textWidth - padding;
            const rectRight = rectLeft + textWidth + padding;
            const rectBottom = rectTop + textHeight + padding;
            const rectWidth = rectRight - rectLeft;
            const rectHeight = rectBottom - rectTop;

            ctx.fillStyle = props.stroke;
            ctx.fillRect(rectLeft, rectTop, rectWidth, rectHeight);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'top';
            ctx.fillText(props.text, rectLeft + (rectWidth / 2 - textWidth / 2), rectTop + (rectHeight / 2 - textHeight / 2));
        }
    }

    setText(text: string): void {
        this.text = text;
        this.setProps({ text });
        this.makeDirty(true);
    }

    setTextSize(textSize: number): void {
        this.textSize = textSize;
        this.setProps({ textSize });
        this.makeDirty(true);
    }

    setBorderColor(color: string): void {
        this.setProps({
            stroke: color,
        });
        this.makeDirty(true);
    }

    setWidth(width: number): void {
        this.width = width;
        this.makeDirty(true);
    }

    setLeft(left: number): void {
        this.translateLeft = left;
        this.translate(this.translateLeft, this.translateTop);
    }

    setTop(top: number): void {
        this.translateTop = top;
        this.translate(this.translateLeft, this.translateTop);
    }

    setHeight(height: number): void {
        this.height = height;
        this.makeDirty(true);
    }

    protected override _draw(ctx: CanvasRenderingContext2D) {
        super._draw(ctx);
        EditTooltips.drawWith(ctx, this);
    }
}
