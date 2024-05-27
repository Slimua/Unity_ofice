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

import React, { useEffect, useState } from 'react';
import { Button, FormLayout, Input, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { Workbook } from '@univerjs/core';
import { createInternalEditorID, ICommandService, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { RangeSelector, useObservable } from '@univerjs/ui';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeToRefString } from '@univerjs/engine-formula';
import { AddHyperLinkCommand, HyperLinkModel, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { CloseHyperLinkSidebarOperation } from '../../commands/operations/sidebar.operations';

enum LinkType {
    link = 'link',
    range = 'range',
    sheet = 'gid',
    definedName = 'rangeid',
}

export const CellLinkEdit = () => {
    const [id, setId] = useState('');
    const [display, setDisplay] = useState('');
    const [type, setType] = useState(LinkType.link);
    const [payload, setPayload] = useState('');
    const localeService = useDependency(LocaleService);
    const definedNameService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const editing = useObservable(popupService.currentEditing$);
    const hyperLinkModel = useDependency(HyperLinkModel);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const commandService = useDependency(ICommandService);

    useEffect(() => {
        if (editing) {
            const link = hyperLinkModel.getHyperLinkByLocation(editing.unitId, editing.subUnitId, editing.row, editing.column);

            if (link) {
                const linkInfo = resolverService.parseHyperLink(link.payload);
                setDisplay(link.display);
                if (linkInfo.type === 'outer') {
                    setType(LinkType.link);
                    setPayload(linkInfo.url);
                    return;
                } else {
                    const params = linkInfo.searchObj;
                    if (params.rangeid) {
                        setType(LinkType.definedName);
                        setPayload(params.rangeid);
                        return;
                    }

                    if (params.range) {
                        setType(LinkType.range);
                        setPayload(params.range);
                        return;
                    }

                    if (params.gid) {
                        setType(LinkType.sheet);
                        setPayload(params.gid);
                        return;
                    }
                }
                setId(link.id);
            }
        }

        setType(LinkType.link);
        setPayload('');
        setDisplay('');
        setId('');
    }, [editing, hyperLinkModel, resolverService]);

    const linkTypeOptions = [
        {
            label: localeService.t('hyperLink.form.link'),
            value: LinkType.link,
        },
        {
            label: localeService.t('hyperLink.form.range'),
            value: LinkType.range,
        },
        {
            label: localeService.t('hyperLink.form.worksheet'),
            value: LinkType.sheet,
        },
        {
            label: localeService.t('hyperLink.form.definedName'),
            value: LinkType.definedName,
        },
    ];
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return;
    }
    const sheetsOption = workbook.getSheets().map((sheet) => ({ label: sheet.getName(), value: sheet.getSheetId() }));
    const definedNames = Object.values(definedNameService.getDefinedNameMap(workbook.getUnitId()) ?? {}).map((value) => ({
        label: value.name,
        value: value.id,
    }));

    const formatUrl = (type: LinkType, payload: string) => {
        if (type === LinkType.link) {
            return payload;
        }

        if (type === LinkType.range) {
            const info = deserializeRangeWithSheet(payload);
            const worksheet = workbook.getSheetBySheetName(info.sheetName);
            if (worksheet) {
                return `#gid=${worksheet.getSheetId()}&range=${serializeRange(info.range)}`;
            }
        }

        return `#${type}=${payload}`;
    };

    const handleSubmit = async () => {
        if (editing) {
            if (id) {
                await commandService.executeCommand(UpdateHyperLinkCommand.id, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    id,
                    payload: {
                        display,
                        payload: formatUrl(type, payload),
                    },
                });
            } else {
                await commandService.executeCommand(AddHyperLinkCommand.id, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    link: {
                        id: Tools.generateRandomId(),
                        row: editing.row,
                        column: editing.column,
                        payload: formatUrl(type, payload),
                        display,
                    },
                });
            }
        }
        commandService.executeCommand(CloseHyperLinkSidebarOperation.id);
    };

    return (
        <div>
            <FormLayout label={localeService.t('hyperLink.form.label')}>
                <Input value={display} onChange={setDisplay} placeholder={localeService.t('hyperLink.form.labelPlaceholder')} />
            </FormLayout>
            <FormLayout label={localeService.t('hyperLink.form.type')}>
                <Select
                    options={linkTypeOptions}
                    value={type}
                    onChange={(newType) => {
                        setType(newType as LinkType);
                        setPayload('');
                    }}
                />
            </FormLayout>
            {type === LinkType.link && (
                <FormLayout>
                    <Input value={payload} onChange={setPayload} placeholder={localeService.t('hyperLink.form.linkPlaceholder')} />
                </FormLayout>
            )}
            {type === LinkType.range && (
                <FormLayout>
                    <RangeSelector
                        id={createInternalEditorID('hyper-link-edit')}
                        isSingleChoice
                        value={payload}
                        onChange={(newValue) => setPayload(serializeRangeToRefString(newValue[0]))}
                    />
                </FormLayout>
            )}
            {type === LinkType.sheet && (
                <FormLayout>
                    <Select options={sheetsOption} value={payload} onChange={setPayload} />
                </FormLayout>
            )}
            {type === LinkType.definedName && (
                <FormLayout>
                    <Select options={definedNames} value={payload} onChange={setPayload} />
                </FormLayout>
            )}
            <div>
                <Button
                    onClick={() => {
                        commandService.executeCommand(CloseHyperLinkSidebarOperation.id);
                    }}
                >
                    {localeService.t('hyperLink.form.cancel')}
                </Button>
                <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                        handleSubmit();
                    }}
                >
                    {localeService.t('hyperLink.form.ok')}
                </Button>
            </div>
        </div>
    );
};

CellLinkEdit.componentKey = 'univer.sheet.cell-link-edit';
