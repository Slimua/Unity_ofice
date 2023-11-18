import { FunctionType, IFunctionInfo, IFunctionParam } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';
import { Input, Select } from '@univerjs/design';
import { CheckMarkSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IDescriptionService, ISearchItem } from '../../../services/description.service';
import { getFunctionTypeValues } from '../../../services/utils';
import { FunctionParams } from '../function-params/FunctionParams';
import styles from './index.module.less';

export interface ISelectFunctionProps {
    onChange: (functionInfo: IFunctionInfo) => void;
}

export function SelectFunction(props: ISelectFunctionProps) {
    const { onChange } = props;
    const allTypeValue = '-1';
    const [searchText, setSearchText] = useState<string>('');
    const [selectList, setSelectList] = useState<ISearchItem[]>([]);
    const [active, setActive] = useState(0);
    const [typeSelected, setTypeSelected] = useState(allTypeValue);
    const [nameSelected, setNameSelected] = useState(0);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const descriptionService = useDependency(IDescriptionService);
    const localeService = useDependency(LocaleService);

    const options = getFunctionTypeValues(FunctionType, localeService);
    options.unshift({
        label: localeService.t(`formula.moreFunctions.allFunctions`),
        value: allTypeValue,
    });

    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');

    useEffect(() => {
        handleSelectChange(allTypeValue);
    }, []);

    useEffect(() => {
        setCurrentFunctionInfo(0);
    }, [selectList]);

    const highlightSearchText = (text: string) => {
        const regex = new RegExp(`(${searchText.toLocaleUpperCase()})`);
        const parts = text.split(regex).filter(Boolean);

        return parts.map((part: string, index: number) => {
            if (part.match(regex)) {
                return (
                    <span key={index} className={styles.formulaSelectFunctionResultItemNameLight}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const setCurrentFunctionInfo = (selectedIndex: number) => {
        if (selectList.length === 0) {
            setFunctionInfo(null);
            return;
        }

        setNameSelected(selectedIndex);
        const functionInfo = descriptionService.getFunctionInfo(selectList[selectedIndex].name);
        if (!functionInfo) {
            setFunctionInfo(null);
            return;
        }

        setFunctionInfo(functionInfo);
        onChange(functionInfo);
    };

    function handleSelectChange(value: string) {
        setTypeSelected(value);
        const selectList = descriptionService.getSearchListByType(+value);
        setSelectList(selectList);
    }

    // TODO@Dushusir: debounce
    function handleSearchInputChange(value: string) {
        setSearchText(value);
        const selectList = descriptionService.getSearchListByName(value);
        setSelectList(selectList);
    }

    function handleSelectListKeyDown(e: React.KeyboardEvent<HTMLUListElement> | React.KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();
        if (e.key === 'ArrowDown') {
            const nextActive = active + 1;
            setActive(nextActive === selectList.length ? 0 : nextActive);
        } else if (e.key === 'ArrowUp') {
            const nextActive = active - 1;
            setActive(nextActive === -1 ? selectList.length - 1 : nextActive);
        } else if (e.key === 'Enter') {
            setCurrentFunctionInfo(active);
        }
    }

    const handleLiMouseEnter = (index: number) => {
        setActive(index);
    };

    const handleLiMouseLeave = () => {
        setActive(-1);
    };

    return (
        <div>
            <div className={styles.formulaSelectFunctionSelect}>
                <Select value={typeSelected} options={options} onChange={handleSelectChange}></Select>

                <Input
                    placeholder={localeService.t(`formula.moreFunctions.searchFunctionPlaceholder`)}
                    onKeyDown={handleSelectListKeyDown}
                    value={searchText}
                    onChange={handleSearchInputChange}
                    size="large"
                    allowClear
                ></Input>
            </div>

            <ul className={styles.formulaSelectFunctionResult} onKeyDown={handleSelectListKeyDown} tabIndex={-1}>
                {selectList.map(({ name }, index) => (
                    <li
                        key={index}
                        className={
                            active === index
                                ? `${styles.formulaSelectFunctionResultItem} ${styles.formulaSelectFunctionResultItemActive}`
                                : styles.formulaSelectFunctionResultItem
                        }
                        onMouseEnter={() => handleLiMouseEnter(index)}
                        onMouseLeave={handleLiMouseLeave}
                        onClick={() => setCurrentFunctionInfo(index)}
                    >
                        {nameSelected === index && (
                            <CheckMarkSingle className={styles.formulaSelectFunctionResultItemSelected} />
                        )}
                        <span className={styles.formulaSelectFunctionResultItemName}>{highlightSearchText(name)}</span>
                    </li>
                ))}
            </ul>

            {functionInfo && (
                <div className={styles.formulaSelectFunctionContent}>
                    <FunctionParams title={functionInfo.functionName} value={functionInfo.description} />

                    <FunctionParams
                        title={localeService.t('formula.moreFunctions.syntax')}
                        value={<Help prefix={functionInfo.functionName} value={functionInfo.functionParameter} />}
                    />

                    <FunctionParams
                        title={localeService.t('formula.prompt.helpExample')}
                        value={`${functionInfo.functionName}(${functionInfo.functionParameter
                            .map((item) => item.example)
                            .join(',')})`}
                    />

                    {functionInfo.functionParameter &&
                        functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                            <FunctionParams
                                key={i}
                                title={item.name}
                                value={`${item.require ? required : optional} ${item.detail}`}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

interface IHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
}

const Help = (props: IHelpProps) => {
    const { prefix, value } = props;
    return (
        <div>
            <span>
                {prefix}
                {'('}
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    <span key={i}>
                        <span>{item.repeat ? `[${item.name},...]` : item.name}</span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            <span>{')'}</span>
        </div>
    );
};
