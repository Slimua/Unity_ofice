import './index.less';

import { LocaleService } from '@univerjs/core';
import { InputNumber, Select, SelectList } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BusinessComponentProps } from '../../base/types';
import { useCurrencyOptions } from '../../hooks/useCurrencyOptions';
import { getCurrencyType } from '../../utils/currency';
import { getDecimalFromPattern, isPatternEqualWithoutDecimal, setPatternDecimal } from '../../utils/decimal';
import { getCurrencyFormatOptions } from '../../utils/options';

export const isCurrencyPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && !pattern.startsWith('_(');
};
const useEffectWithoutFirst = (cb: () => () => void, dep: unknown[]) => {
    const ref = useRef(false);
    useEffect(() => {
        if (!ref.current) {
            ref.current = true;
            return;
        }
        return cb();
    }, dep);
};
export const CurrencyPanel: FC<BusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [suffix, suffixSet] = useState('');
    const { options } = useCurrencyOptions((list) => {
        const suffix = getCurrencyType(props.defaultPattern) || list[0];
        suffixSet(suffix);
        const negativeOptions = getCurrencyFormatOptions(suffix);
        const pattern =
            negativeOptions.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern))?.value ||
            negativeOptions[0].value;
        patternSet(pattern);
    });

    const negativeOptions = useMemo(() => getCurrencyFormatOptions(suffix), [suffix]);

    const [pattern, patternSet] = useState(() => {
        const _defaultPattern = getCurrencyFormatOptions(suffix)[0].value;
        if (!props.defaultPattern) {
            return _defaultPattern;
        }
        const defaultPattern = props.defaultPattern;
        return (
            negativeOptions.find((item) => isPatternEqualWithoutDecimal(item.value, defaultPattern))?.value ||
            _defaultPattern
        );
    });

    const resultPattern = useMemo(() => setPatternDecimal(pattern, decimal), [pattern, decimal]);

    useEffect(() => {
        props.onChange(resultPattern);
    }, [resultPattern]);

    const onSelect = (value: string) => {
        suffixSet(value);
        patternSet(getCurrencyFormatOptions(value)[0].value);
    };

    return (
        <div>
            <div className="m-t-16 options ">
                <div className="option">
                    <div className="label">{t('sheet.numfmt.decimalLength')}</div>
                    <div className="m-t-8 w-120">
                        <InputNumber value={decimal} max={20} min={0} onChange={(value) => decimalSet(value || 0)} />
                    </div>
                </div>
                <div className="option">
                    <div className="label"> {t('sheet.numfmt.currencyType')}</div>
                    <div className="m-t-8 w-140">
                        <Select onChange={onSelect} options={options} value={suffix}></Select>
                    </div>
                </div>
            </div>
            <div className="m-t-16 label"> {t('sheet.numfmt.negType')}</div>

            <div className="m-t-8">
                <SelectList onChange={patternSet} options={negativeOptions} value={pattern} />
            </div>

            <div className="describe m-t-14">{t('sheet.numfmt.currencyDes')}</div>
        </div>
    );
};
