import { DocUIPlugin } from '../DocUIPlugin';
import { InfoBarModel } from '../Model';
import { InfoBar } from '../View/InfoBar';

type IProps = {
    label?: string;
    onBlur?: (e: FocusEvent) => void;
};

export interface BaseInfoBarProps {
    back: IProps;
    rename: IProps;
    save: IProps;
    sheet: IProps;
    update: IProps;
}

export class InfoBarUIController {
    private _infoBarModel: InfoBarModel;

    private _infoBar: InfoBar;

    private _infoList: BaseInfoBarProps;

    getComponent = (ref: InfoBar) => {
        this._infoBar = ref;
        this._refreshComponent();
        this.resetInfoList(this._infoList);
    };

    resetInfoList(list: BaseInfoBarProps) {
        this._infoBar.setInfoList(list);
    }

    setSheetName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel.setName(name);
    }

    private _refreshComponent(): void {
        const name = 'UniverDoc';
        this._infoBarModel = new InfoBarModel(name);
        this._infoList = {
            back: {
                label: 'info.return',
            },
            rename: {
                label: 'info.tips',
            },
            update: {
                label: 'info.detailUpdate',
            },
            save: {
                label: 'info.detailSave',
            },
            sheet: {
                label: name,
                onBlur: (e) => {
                    this.setSheetName(e);
                },
            },
        };
    }
}