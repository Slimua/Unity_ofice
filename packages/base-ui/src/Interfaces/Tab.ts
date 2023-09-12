import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

interface IProps {
    className?: string;
    style?: React.CSSProperties;
    children?: any;
}

export interface BaseTabPaneProps {
    active?: boolean;
    tab?: JSX.Element | string;
    keys?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: any;
}

export interface BaseTabProps extends IProps, BaseComponentProps {
    type?: 'card';
    activeKey?: string;
    onTabClick?: (activeKey: string, e: Event) => void;
}

export interface TabComponent extends BaseComponent<BaseTabProps> {
    render(): JSXComponent<BaseTabProps>;
}

export interface TabPaneComponent extends BaseComponent<BaseTabPaneProps> {
    render(): JSXComponent<BaseTabPaneProps>;
}
