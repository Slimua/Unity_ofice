import { IFunctionInfo, IFunctionParam } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { CloseSingle, DetailsSingle, MoreSingle } from '@univerjs/icons';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IFormulaPromptService, IHelpFunctionCommandParams } from '../../../services/prompt.service';
import styles from './index.module.less';

export function HelpFunction() {
    const [visible, setVisible] = useState(false);
    const [contentVisible, setContentVisible] = useState(true);
    const [helpVisible, setHelpVisible] = useState(true);
    const [paramIndex, setParamIndex] = useState(0);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const [decoratorPosition, setDecoratorPosition] = useState({ left: 0, top: 0 });
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const localeService = useDependency(LocaleService);
    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');

    useEffect(() => {
        const subscription = promptService.help$.subscribe((params: IHelpFunctionCommandParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { visible, paramIndex, functionInfo } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            const localeInfo: IFunctionInfo = {
                functionName: functionInfo.functionName,
                functionType: functionInfo.functionType,
                description: localeService.t(functionInfo.description),
                abstract: localeService.t(functionInfo.abstract),
                functionParameter: functionInfo.functionParameter.map((item) => ({
                    name: localeService.t(item.name),
                    detail: localeService.t(item.detail),
                    example: item.example,
                    require: item.require,
                    repeat: item.repeat,
                })),
            };
            const { startX = 0, startY = 0, endY = 0 } = selection;
            setOffset([startX, endY]);
            setParamIndex(paramIndex);
            setFunctionInfo(localeInfo);
            setDecoratorPosition({ left: startX, top: startY });
            setVisible(visible);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    function handleSwitchActive(paramIndex: number) {
        setParamIndex(paramIndex);
    }

    return (
        <>
            {helpVisible ? (
                <Dropdown
                    visible={visible}
                    align={{ offset }}
                    overlay={
                        functionInfo ? (
                            <div className={styles.formulaHelpFunction}>
                                <div className={styles.formulaHelpFunctionTitle}>
                                    <Help
                                        prefix={functionInfo.functionName}
                                        value={functionInfo.functionParameter}
                                        active={paramIndex}
                                        onClick={handleSwitchActive}
                                    />
                                    <div className={styles.formulaHelpFunctionTitleIcons}>
                                        <div
                                            className={styles.formulaHelpFunctionTitleIcon}
                                            style={{ transform: contentVisible ? 'rotateZ(-90deg)' : 'rotateZ(90deg)' }}
                                            onClick={() => setContentVisible(!contentVisible)}
                                        >
                                            <MoreSingle />
                                        </div>
                                        <div
                                            className={styles.formulaHelpFunctionTitleIcon}
                                            onClick={() => setHelpVisible(!helpVisible)}
                                        >
                                            <CloseSingle />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={styles.formulaHelpFunctionContent}
                                    style={{ height: contentVisible ? 'unset' : 0 }}
                                >
                                    <div className={styles.formulaHelpFunctionContentInner}>
                                        <Params
                                            title={localeService.t('formula.prompt.helpExample')}
                                            value={`${functionInfo.functionName}(${functionInfo.functionParameter
                                                .map((item) => item.example)
                                                .join(',')})`}
                                        />
                                        <Params
                                            title={localeService.t('formula.prompt.helpAbstract')}
                                            value={functionInfo.description}
                                        />
                                        {functionInfo &&
                                            functionInfo.functionParameter &&
                                            functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                                                <Params
                                                    key={i}
                                                    className={paramIndex === i ? styles.formulaHelpFunctionActive : ''}
                                                    title={item.name}
                                                    value={`${item.require ? required : optional} ${item.detail}`}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )
                    }
                >
                    <span></span>
                </Dropdown>
            ) : visible ? (
                <div
                    className={styles.formulaHelpDecorator}
                    onClick={() => setHelpVisible(!helpVisible)}
                    style={{ left: decoratorPosition.left - 24, top: decoratorPosition.top }}
                >
                    <DetailsSingle />
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
}

const Params = (props: IParamsProps) => (
    <div className={styles.formulaHelpFunctionContentParams}>
        <div className={`${styles.formulaHelpFunctionContentParamsTitle} ${props.className}`}>{props.title}</div>
        <div className={styles.formulaHelpFunctionContentParamsDetail}>{props.value}</div>
    </div>
);

interface IHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
    active: number;
    onClick: (paramIndex: number) => void;
}

const Help = (props: IHelpProps) => {
    const { prefix, value, active, onClick } = props;
    return (
        <div>
            <span>{prefix}(</span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    // TODO@Dushusir: more params needs to be active
                    <span key={i}>
                        <span
                            className={active === i ? styles.formulaHelpFunctionActive : ''}
                            onClick={() => onClick(i)}
                        >
                            {item.repeat ? `[${item.name},...]` : item.name}
                        </span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            )
        </div>
    );
};
