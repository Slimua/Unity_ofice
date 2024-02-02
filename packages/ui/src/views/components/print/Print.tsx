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
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { ComponentManager } from '../../../common/component-manager';
import { IPrintService } from '../../../services/print/print.service';
import { useObservable } from '../../../components/hooks/observable';

import styles from './index.module.less';

export function Print() {
    const printService = useDependency(IPrintService);
    const [visible, setVisible] = useState(false);
    const componentKey = useObservable(printService.componentKey$);
    const componentManager = useDependency(ComponentManager);

    const _className = clsx(styles.print, styles.printOpen);

    const Component = useMemo(() => {
        const Component = componentManager.get(componentKey ?? '');
        if (Component) {
            return Component;
        }
    }, [componentKey]);

    useEffect(() => {
        const subscription = printService.visible$.subscribe((val) => {
            setVisible(val);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [printService.visible$]);

    if (!visible) {
        return null;
    }

    return <section className={_className}>{Component && <Component />}</section>;
}
