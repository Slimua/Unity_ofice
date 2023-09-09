import { Component, createRef } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseColorPickerCircleButtonProps, ColorPickerCircleButtonComponent } from '../../Interfaces';
import { NextIcon } from '../Icon';
import { ColorPicker } from '../index';
import Styles from './index.module.less';

interface IState {}

/**
 * e2e test,check Components.playwright.test.ts
 */
export class ColorPickerCircleButton extends Component<BaseColorPickerCircleButtonProps, IState> {
    ref = createRef<HTMLDivElement>();

    colorRef = createRef();

    /**
     * handle ColorSelectButton Click,show color picker
     */
    handleColorSelectButtonClick = (e: Event) => {
        e.stopImmediatePropagation();
        this.colorRef.current.showSelect(this.ref.current);
    };

    render() {
        const { color, onClick, onCancel, style, colorPickerStyle } = this.props;

        return (
            <div style={style} className={Styles.colorPickerCircleButton} ref={this.ref} onClick={this.handleColorSelectButtonClick}>
                <span className={`${Styles.colorSelectCircle} ${Styles.verticalMiddle}`} style={{ backgroundColor: color }}></span>
                <NextIcon className={Styles.verticalMiddle} />
                <ColorPicker color={color} onClick={onClick} onCancel={onCancel} style={colorPickerStyle} ref={this.colorRef} />
            </div>
        );
    }
}

export class UniverColorPickerCircleButton implements ColorPickerCircleButtonComponent {
    render(): JSXComponent<BaseColorPickerCircleButtonProps> {
        return ColorPickerCircleButton;
    }
}
