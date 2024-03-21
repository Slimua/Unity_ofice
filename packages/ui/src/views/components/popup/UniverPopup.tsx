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

import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';
import { RectPopup } from '@univerjs/design';
import { IGlobalPopupManagerService } from '@univerjs/ui';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import { useObservable } from '../../../components/hooks/observable';
import { ComponentManager } from '../../../common';
import type { IPopup } from '../../../services/popup/global-popup-manager.service';

const SingleUniverPopup = ({ popup, children }: { popup: IPopup; children?: React.ReactNode }) => {
    const anchorRect = useObservable(popup.anchorRect$, popup.anchorRect);
    const rect: IBoundRectNoAngle = useMemo(() => {
        const [x = 0, y = 0] = popup.offset ?? [];
        return {
            left: anchorRect.left - x,
            right: anchorRect.right + x,
            top: anchorRect.top - y,
            bottom: anchorRect.bottom + y,
        };
    }, [anchorRect.bottom, anchorRect.left, anchorRect.right, anchorRect.top, popup.offset]);

    return (
        <RectPopup
            anchorRect={rect}
            direction={popup.direction}
            onClickOther={popup.onMaskClick}
        >

            {children}
        </RectPopup>
    );
};

export function UniverPopup() {
    const popupService = useDependency(IGlobalPopupManagerService);
    const popups = useObservable(popupService.popups$, popupService.popups);
    const componentManager = useDependency(ComponentManager);

    return popups.map((item) => {
        const [key, popup] = item;
        const Component = componentManager.get(popup.componentKey);
        return (
            <SingleUniverPopup
                key={key}
                popup={popup}
            >

                {Component ? <Component /> : null}
            </SingleUniverPopup>
        );
    });
}
