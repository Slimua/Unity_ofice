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

import React, { memo, useEffect, useState } from 'react';
import { Injector } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { ISheetDataValidationRule } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { createDefaultNewRule, DataValidationModel, RemoveAllDataValidationCommand } from '@univerjs/data-validation';
import { Button } from '@univerjs/design';
import { DataValidationPanelService } from '@univerjs/data-validation/services/data-validation-panel.service.js';
import { DataValidationItem } from '../item';
import type { IAddSheetDataValidationCommandParams } from '../../commands/commands/data-validation.command';
import { AddSheetDataValidationCommand } from '../../commands/commands/data-validation.command';
import styles from './index.module.less';

export const DataValidationList = memo(() => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const dataValidationModel = useDependency(DataValidationModel);
    const commandService = useDependency(ICommandService);
    const injector = useDependency(Injector);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const manager = dataValidationModel.ensureManager(unitId, subUnitId);
    const localeService = useDependency(LocaleService);
    const [rules, setRules] = useState<ISheetDataValidationRule[]>(manager.getDataValidations());

    useEffect(() => {
        const subscription = manager.dataValidations$.subscribe((currentRules) => {
            setRules([...currentRules]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [manager.dataValidations$]);

    const handleAddRule = async () => {
        const rule = createDefaultNewRule(injector);
        const params: IAddSheetDataValidationCommandParams = {
            unitId,
            subUnitId,
            rule,
        };
        await commandService.executeCommand(AddSheetDataValidationCommand.id, params);
        dataValidationPanelService.setActiveRule(rule);
    };

    const handleRemoveAll = () => {
        commandService.executeCommand(RemoveAllDataValidationCommand.id);
    };

    return (
        <div>
            {rules.map((rule) => (
                <DataValidationItem
                    unitId={unitId}
                    subUnitId={subUnitId}
                    onClick={() => dataValidationPanelService.setActiveRule(rule)}
                    rule={rule}
                    key={rule.uid}
                />
            ))}
            <div className={styles.dataValidationListButtons}>
                <Button className={styles.dataValidationListButton} onClick={handleRemoveAll}>
                    {localeService.t('dataValidation.panel.removeAll')}
                </Button>
                <Button className={styles.dataValidationListButton} type="primary" onClick={handleAddRule}>
                    {localeService.t('dataValidation.panel.add')}
                </Button>
            </div>
        </div>
    );
});
