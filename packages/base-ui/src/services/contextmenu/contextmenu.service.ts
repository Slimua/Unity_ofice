import { Engine, IMouseEvent, IPointerEvent, IRenderingEngine } from '@univerjs/base-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

export interface IContextMenuHandler {
    handleContextMenu(event: IPointerEvent | IMouseEvent): void;
}

export interface IContextMenuService {
    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable;
}

export const IContextMenuService = createIdentifier<IContextMenuService>('univer.context-menu-service');

export class DesktopContextMenuService extends Disposable implements IContextMenuService {
    private _currentHandler: IContextMenuHandler | null = null;

    constructor(@IRenderingEngine private readonly _renderingEngine: Engine) {
        super();
    }

    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable {
        if (this._currentHandler) {
            throw new Error('Cannot add context menu handler twice.');
        }

        this._currentHandler = handler;
        const pointerDownOnMain = this._renderingEngine.getScene('mainScene')?.onPointerDownObserver;
        const observer = pointerDownOnMain?.add((event: IPointerEvent | IMouseEvent) => {
            // right click
            if (event.button === 2) {
                event.preventDefault();
                this._currentHandler?.handleContextMenu(event);
            }
        });

        return toDisposable(() => {
            this._currentHandler = null;
            pointerDownOnMain?.remove(observer);
        });
    }
}
