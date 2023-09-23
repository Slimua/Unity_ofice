import { IMouseEvent, IPointerEvent, IRenderManagerService } from '@univerjs/base-render';
import { Disposable, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

export interface IContextMenuHandler {
    handleContextMenu(event: IPointerEvent | IMouseEvent): void;
}

export interface IContextMenuService {
    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable;
}

export const IContextMenuService = createIdentifier<IContextMenuService>('univer.context-menu-service');

// TODO: support context menu in cell editor?

export class DesktopContextMenuService extends Disposable implements IContextMenuService {
    private _currentHandler: IContextMenuHandler | null = null;

    constructor(@IRenderManagerService private readonly _renderManagerService: IRenderManagerService) {
        super();
    }

    registerContextMenuHandler(handler: IContextMenuHandler): IDisposable {
        if (this._currentHandler) {
            throw new Error('Cannot add context menu handler twice.');
        }

        this._currentHandler = handler;

        // FIXME@wzhudev: shouldn't set timeout here, because we should not get pointer down event on mainScene but
        // rendering engine itself
        setTimeout(() => {
            const mainScene = this._renderManagerService.getCurrent()?.scene;
            if (mainScene == null) {
                return;
            }
            const pointerDownOnMain = mainScene.onPointerDownObserver;
            const observer = pointerDownOnMain?.add((event: IPointerEvent | IMouseEvent) => {
                // right click
                if (event.button === 2) {
                    event.preventDefault();
                    this._currentHandler?.handleContextMenu(event);
                }
            });
        }, 200);

        return toDisposable(() => {
            this._currentHandler = null;
            // pointerDownOnMain?.remove(observer);
        });
    }
}
