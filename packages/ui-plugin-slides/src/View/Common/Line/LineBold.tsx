import { BaseComponentProps, Icon, CustomLabel } from '@univerjs/base-ui';
import { Component } from 'react';
import { SlideUIPlugin } from '../../..';
import { SLIDE_UI_PLUGIN_NAME } from '../../../Basics';

interface IState {
    img: string;
}

interface IProps extends BaseComponentProps {
    label: string;
    img: string;
}

export class LineBold extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            img: '',
        };
    }

    override componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    override UNSAFE_componentWillReceiveProps(props: IProps) {
        this.setState({
            img: props.img,
        });
    }

    setImg(img: string = '') {
        this.setState({
            img,
        });
    }

    getImg(img: string) {
        if (!img) return null;
        const span = document.querySelector('.base-sheets-line-bold') as HTMLDivElement;
        const props = { width: span.offsetWidth };
        const componentManager = this.getContext().getPluginManager().getPluginByName<SlideUIPlugin>(SLIDE_UI_PLUGIN_NAME)?.getComponentManager();
        const Img = componentManager?.get(img);
        return <Img {...(props as any)} />;
    }

    render() {
        const { img } = this.state;
        const { label } = this.props;
        return (
            <div style={{ paddingBottom: '3px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={'base-sheets-line-bold'} style={{ position: 'relative' }}>
                    <CustomLabel label={label} />
                    <div style={{ width: '100%', height: 0, position: 'absolute', left: 0, bottom: '14px' }}>{img.length ? this.getImg(img) : ''}</div>
                </span>
                <Icon.RightIcon />
            </div>
        );
    }
}
