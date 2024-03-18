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

import { ICommandService, type ISheetDataValidationRule } from '@univerjs/core';
import { DataValidatorRegistryService, RemoveDataValidationCommand } from '@univerjs/data-validation';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useRef } from 'react';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle } from '@univerjs/icons';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import styles from './index.module.less';

export interface IDataValidationDetailProps {
    rule: ISheetDataValidationRule;
    onClick: () => void;
    unitId: string;
    subUnitId: string;
}

export const DataValidationItem = (props: IDataValidationDetailProps) => {
    const { rule, onClick, unitId, subUnitId } = props;
    const validatorRegistry = useDependency(DataValidatorRegistryService);
    const commandService = useDependency(ICommandService);
    const markSelectionService = useDependency(IMarkSelectionService);
    const validator = validatorRegistry.getValidatorItem(rule.type);
    const ids = useRef<(string | null)[]>();
    const handleDelete = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        commandService.executeCommand(RemoveDataValidationCommand.id, {
            ruleId: rule.uid,
            unitId,
            subUnitId,
        });
        e.stopPropagation();
    };

    return (
        <div
            className={styles.dataValidationItemContainer}
            onClick={onClick}
            onMouseEnter={() => {
                ids.current = rule.ranges.map((range) => markSelectionService.addShape({
                    range,
                    style: null,
                    primary: {
                        startColumn: range.startColumn,
                        endColumn: range.endColumn,
                        startRow: range.startRow,
                        endRow: range.endRow,
                        actualRow: range.startRow,
                        actualColumn: range.startColumn,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                }));
            }}
            onMouseLeave={() => {
                ids.current?.forEach((id) => {
                    id && markSelectionService.removeShape(id);
                });
            }}
        >
            <div className={styles.dataValidationItemTitle}>
                {validator?.generateRuleName(rule)}
            </div>
            <div className={styles.dataValidationItemContent}>
                {rule.ranges.map((range) => serializeRange(range)).join(',')}
            </div>
            <div className={styles.dataValidationItemIcon} onClick={handleDelete}>
                <DeleteSingle />
            </div>
        </div>
    );
};
