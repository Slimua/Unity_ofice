import { IShapeProps, Rect, RegularPolygon, Shape } from '@univerjs/base-render';

import { HEADER_MENU_BACKGROUND_COLOR, HEADER_MENU_SHAPE_TRIANGLE_FILL } from './header-menu-shape';

export const enum HeaderUnhideShapeType {
    ROW,
    COLUMN,
}

export interface IHeaderUnhideShapeProps extends IShapeProps {
    /** On row headers or on column headers. */
    type: HeaderUnhideShapeType;
    /** If the shape is hovered. If it's hovered it should have a border. */
    hovered: boolean;
    /** This hidden position has previous rows/cols. */
    hasPrevious: boolean;
    /** This hidden position has succeeding rows/cols. */
    hasNext: boolean;
}

export class HeaderUnhideShape<T extends IHeaderUnhideShapeProps = IHeaderUnhideShapeProps> extends Shape<T> {
    private _size = 12;
    private _iconRatio = 0.4;
    private _hovered = true;
    private _hasPrevious = true;
    private _hasNext = true;
    private _unhideType!: HeaderUnhideShapeType;

    constructor(key?: string, props?: T, onClick?: () => void) {
        super(key, props);
        if (props) {
            this.setShapeProps(props);
        }

        this.onPointerEnterObserver.add(() => this.setShapeProps({ hovered: true }));
        this.onPointerLeaveObserver.add(() => this.setShapeProps({ hovered: false }));
        this.onPointerDownObserver.add(() => onClick?.());
    }

    setShapeProps(props: Partial<IHeaderUnhideShapeProps>): void {
        if (props.type !== undefined) {
            this._unhideType = props.type;
        }
        if (props.hovered !== undefined) {
            this._hovered = props.hovered;
        }
        if (props.hasPrevious !== undefined) {
            this._hasPrevious = props.hasPrevious;
        }
        if (props.hasNext !== undefined) {
            this._hasNext = props.hasNext;
        }

        this.transformByState({
            width: this._size * (this._unhideType === HeaderUnhideShapeType.COLUMN ? 2 : 1),
            height: this._size * (this._unhideType === HeaderUnhideShapeType.ROW ? 2 : 1),
        });
    }

    protected override _draw(ctx: CanvasRenderingContext2D): void {
        if (this._unhideType === HeaderUnhideShapeType.ROW) {
            this._drawOnRow(ctx);
        } else {
            this._drawOnCol(ctx);
        }
    }

    private _drawOnRow(ctx: CanvasRenderingContext2D): void {
        if (this._hovered) {
            if (!this._hasNext || !this._hasPrevious) {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            } else {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: 2 * this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            }
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = Math.PI / 3;
        const top = iconSize * Math.cos(sixtyDegree);
        const left = iconSize * Math.sin(sixtyDegree);

        if (this._hasPrevious) {
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: this._size / 2, y: this._size / 2 - left },
                        { x: this._size / 2 - left, y: this._size / 2 + top },
                        { x: this._size / 2 + left, y: this._size / 2 + top },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }

        if (this._hasNext) {
            const offset = this._hasPrevious ? 3 : 1;
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: this._size / 2, y: (this._size * offset) / 2 + left },
                        { x: this._size / 2 - left, y: (this._size * offset) / 2 - top },
                        { x: this._size / 2 + left, y: (this._size * offset) / 2 - top },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }
    }

    /**
     *
     * @param ctx
     */
    private _drawOnCol(ctx: CanvasRenderingContext2D): void {
        if (this._hovered) {
            if (!this._hasNext || !this._hasPrevious) {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            } else {
                Rect.drawWith(ctx, {
                    width: 2 * this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            }
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = Math.PI / 3;
        const top = iconSize * Math.cos(sixtyDegree);
        const left = iconSize * Math.sin(sixtyDegree);

        if (this._hasPrevious) {
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: -top + this._size / 2, y: this._size / 2 },
                        { x: this._size / 2 + left, y: this._size / 2 - left },
                        { x: this._size / 2 + left, y: this._size / 2 + left },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }

        if (this._hasNext) {
            const offset = this._hasPrevious ? 3 : 1;
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: top + (this._size * offset) / 2, y: this._size / 2 },
                        { x: -left + (this._size * offset) / 2, y: this._size / 2 - left },
                        { x: -left + (this._size * offset) / 2, y: this._size / 2 + left },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }
    }
}
