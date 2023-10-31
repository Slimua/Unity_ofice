import { AppContext } from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import { Component } from 'react';

import { IConfig } from '../../../Basics/Interfaces/IFormula';

interface IProps {
    visible: boolean;
    onOk: () => void;
    onCancel: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    config: IConfig;
}

interface IState {
    option: Array<{ key: number; value: string }>;
    divisionMode: string;
    locale: any;
}

class IfGenerate extends Component<IProps, IState> {
    static override contextType = AppContext;

    private _localeObserver: Nullable<Observer<Workbook>>;

    constructor(props: IProps) {
        super(props);

        // super(props);
        this.state = {
            option: [
                { key: 1, value: '划分值相同' },
                { key: 2, value: '划分为N份' },
                { key: 3, value: '自定义输入' },
            ],
            divisionMode: '',
            locale: null,
        };
    }

    /**
     * init
     */
    override UNSAFE_componentWillMount() {
        this.setLocale();
    }

    setLocale() {
        const localeService = (this.context as any).injector!.get('localeService');
        const locale = localeService.getLocale().get('formula');

        this.setState({ locale });
    }

    override render() {
        const { locale } = this.state;
        return (
            // <Modal
            //     title={locale.formula.if}
            //     width={320}
            //     isDrag={true}
            //     footer={false}
            //     visible={this.props.visible}
            //     onCancel={this.props.onCancel}
            // >
            //     <div className={styles.ifGenerate}>
            //         <div>
            //             <div className={styles.label}>{locale.ifFormula.ifGenCompareValueTitle}</div>
            //             <div className={styles.input}>
            //                 <input type="text" />
            //             </div>
            //         </div>
            //         <div>
            //             <div className={styles.label}>{locale.ifFormula.ifGenRangeTitle}</div>
            //             <div className={styles.inputSection}>
            //                 <div className={styles.input}>
            //                     <input type="text" />
            //                 </div>
            //                 <div>&nbsp;{locale.ifFormula.ifGenRangeTo}&nbsp;</div>
            //                 <div className={styles.input}>
            //                     <input type="text" />
            //                 </div>
            //             </div>
            //             <div className={styles.input}>
            //                 <input type="text" />
            //             </div>
            //         </div>
            //         <div>
            //             <div className={styles.label}>{locale.ifFormula.ifGenCutWay}</div>
            //             <div className={styles.inputSection}>
            //                 {/* <Select
            //                     options={this.state.option}
            //                     onChange={(val) => {
            //                         this.setState({ divisionMode: val.value });
            //                     }}
            //                 /> */}
            //                 <Select children={this.state.option as unknown as BaseSelectProps[]}></Select>
            //                 <div className={styles.input} style={{ marginLeft: '10px' }}>
            //                     <input type="text" />
            //                 </div>
            //             </div>
            //             <div
            //                 style={{
            //                     textAlign: 'center',
            //                     backgroundColor: '#1890ff',
            //                     color: '#fff',
            //                     fontSize: '14px',
            //                     padding: '5px',
            //                     borderRadius: '3px',
            //                 }}
            //             >
            //                 {locale.ifFormula.ifGenCutSame}
            //             </div>
            //         </div>
            //         <div className={styles.ifGenerateCode}>
            //             <div className={styles.input}>
            //                 <input type="text" placeholder={locale.ifFormula.ifGenTipLableTitile} />
            //             </div>
            //             <div className={styles.inputGroup}>
            //                 <input className={styles.inputGroupBig} type="text" />
            //                 <input className={styles.inputGroupSmall} type="text" />
            //                 <span>E6</span>
            //                 <input className={styles.inputGroupSmall} type="text" />
            //                 <input className={styles.inputGroupBig} type="text" />
            //             </div>
            //         </div>
            //         <div className={styles.btnGroup}>
            //             <Button className={`${styles.cancelBtn} ${styles.btn}`}>{locale.cancel}</Button>
            //             <Button className={`${styles.cleanBtn} ${styles.btn}`}>{locale.ClearValidation}</Button>
            //             <Button className={`${styles.okBtn} ${styles.btn}`}>{locale.ok}</Button>
            //         </div>
            //     </div>
            // </Modal>
            <></>
        );
    }
}

export { IfGenerate };
