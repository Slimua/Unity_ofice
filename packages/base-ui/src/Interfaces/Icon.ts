import { ComponentChildren } from 'react';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseIconProps extends BaseComponentProps {
    spin?: boolean;
    rotate?: number;
    style?: JSX.CSSProperties;
    className?: string;
    children?: ComponentChildren;
    name?: string;
    width?: string;
    height?: string;
}

export interface IconComponent extends BaseComponent<BaseIconProps> {
    render(): JSXComponent<BaseIconProps>;
}
