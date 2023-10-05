import { IRenderManagerService } from '@univerjs/base-render';
import { Disposable, LifecycleService, LifecycleStages, toDisposable } from '@univerjs/core';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import React, { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { Observable, Subject } from 'rxjs';

import { App } from '../../views/app';
import { IUIController, IWorkbenchOptions } from './ui.controller';

/**
 * IDesktopUIController
 */
export interface IDesktopUIController extends IUIController {
    componentRegistered$: Observable<void>;

    // provides multi methods for business to register workbench custom components
    // TODO@wzhudev: in the future we may bind components to different business types

    // footer bar
    registerFooterComponent(component: () => ComponentType): IDisposable;
    getFooterComponents(): Set<() => ComponentType>;

    registerSidebarComponent(component: () => ComponentType): IDisposable;
    getSidebarComponents(): Set<() => ComponentType>;
}

export class DesktopUIController extends Disposable implements IDesktopUIController {
    private _footerComponents: Set<() => ComponentType> = new Set();

    private _sidebarComponents: Set<() => ComponentType> = new Set();

    private _componentRegistered$ = new Subject<void>();

    componentRegistered$ = this._componentRegistered$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    bootstrapWorkbench(options: IWorkbenchOptions): void {
        this.disposeWithMe(
            bootStrap(this._injector, options, (element) => {
                this._renderManagerService.defaultEngine.setContainer(element);
                this._lifecycleService.stage = LifecycleStages.Rendered;
            })
        );
    }

    registerFooterComponent(component: () => ComponentType): IDisposable {
        this._footerComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._footerComponents.delete(component));
    }

    getFooterComponents(): Set<() => ComponentType> {
        return new Set([...this._footerComponents]);
    }

    registerSidebarComponent(component: () => ComponentType): IDisposable {
        this._sidebarComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._footerComponents.delete(component));
    }

    getSidebarComponents(): Set<() => React.ComponentType> {
        return new Set([...this._sidebarComponents]);
    }
}

function bootStrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (containerEl: HTMLElement) => void
): IDisposable {
    let mountContainer: HTMLElement;

    const container = options.container;
    if (typeof container === 'string') {
        const containerElement = document.getElementById(container);
        if (!containerElement) {
            mountContainer = createContainer(container);
        } else {
            mountContainer = containerElement;
        }
    } else if (container instanceof HTMLElement) {
        mountContainer = container;
    } else {
        mountContainer = createContainer('univer');
    }

    const root = createRoot(mountContainer);
    const ConnectedApp = connectInjector(App, injector);
    root.render(<ConnectedApp {...options} onRendered={callback} />);

    const desktopUIController = injector.get(IUIController) as IDesktopUIController;
    const updateSubscription = desktopUIController.componentRegistered$.subscribe(() => {
        const footerComponents = desktopUIController.getFooterComponents();
        const sidebarComponents = desktopUIController.getSidebarComponents();
        root.render(
            <ConnectedApp
                {...options}
                footerComponents={footerComponents}
                sidebarComponents={sidebarComponents}
                onRendered={callback}
            />
        );
    });

    return toDisposable(() => {
        root.unmount();
        updateSubscription.unsubscribe();
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    // FIXME: the element is not append to the DOM tree. So it won't be rendered.
    return element;
}
