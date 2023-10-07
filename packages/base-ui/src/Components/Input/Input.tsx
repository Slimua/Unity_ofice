import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils/util';
import styles from './Style/index.module.less';

// Component Interface
export interface BaseInputProps extends BaseComponentProps {
    /**
     * Input's class name
     */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * The type of input
     * @default 'text'
     */
    type?:
        | 'text'
        | 'button'
        | 'checkbox'
        | 'file'
        | 'hidden'
        | 'image'
        | 'password'
        | 'radio'
        | 'reset'
        | 'submit'
        | 'number';

    /**
     * The input content value
     */
    value?: string;

    /**
     * The input content placeholder
     */
    placeholder?: string;

    /**
     *
     * Callback when user input
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    /**
     * Whether has border style
     * @default true
     */
    bordered?: boolean;

    /**
     * Whether the input is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * The maximum number of characters in Input
     */
    maxLength?: number;

    /**
     * Whether the input is focused
     */
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;

    /**
     * Whether the input is blur
     */
    onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;

    /**
     * Whether the input is clicked
     */
    onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;

    onValueChange?: (value: string) => void;

    /**
     * Whether the input is read only
     * @default false
     */
    readonly?: boolean;

    /**
     * Input's id
     */
    id?: string;

    /**
     * When Type is Number, the maximum value
     */
    max?: number;

    /**
     * When Type is Number, the minimum value
     */
    min?: number;
}

/**
 * Input Component
 */
export function Input(props: BaseInputProps) {
    const ref = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(props.value);
    const [focused, setFocused] = useState(false);

    const realValue = useMemo(() => value ?? props.value ?? '', [value, props.value]);

    useEffect(() => {
        if (props.value && props.value !== value) {
            setValue(props.value);
        }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = props;
        const target = e.target;

        setValue(target.value);
        if (!onChange) return;
        onChange(e);
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            ref.current?.blur();
        }
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onFocus } = props;
        onFocus?.(e);
        setFocused(true);
    };

    const onClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.stopPropagation();
        const { onClick } = props;
        onClick?.(e);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        const { onBlur, onValueChange } = props;
        onBlur?.(e);
        let v = getValue();

        if (v == null) return;

        // Limit the size according to MAX MIN
        const { max, min } = props;
        if (props.type === 'number') {
            if (typeof max === 'number' && +v > max) {
                setValue(max.toString());
                v = max.toString();
            } else if (typeof min === 'number' && +v < min) {
                setValue(min.toString());
                v = min.toString();
            } else {
                setValue(v);
            }
        } else {
            setValue(v);
        }

        v && onValueChange?.(v);
        setFocused(false);
    };

    const getValue = () => ref.current?.value;

    const {
        id,
        disabled,
        type = 'text',
        placeholder,
        bordered = true,
        className = '',
        style = {},
        readonly,
        maxLength,
        max,
        min,
    } = props;

    const classes = joinClassNames(
        styles.input,
        {
            [`${styles.input}-disable`]: disabled,
            [`${styles.input}-borderless`]: !bordered,
        },
        className
    );

    return (
        <input
            type={type}
            style={style}
            onBlur={onBlur}
            onFocus={onFocus}
            className={classes}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            onChange={handleChange}
            value={realValue}
            onClick={onClick}
            readOnly={readonly}
            id={id}
            onKeyUp={handlePressEnter}
            max={max}
            min={min}
        />
    );
}
