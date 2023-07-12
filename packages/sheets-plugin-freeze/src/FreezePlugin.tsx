import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { FROZEN_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { IConfig } from './IData';
import { en, zh } from './Model/Locale';
import { FreezeButton } from './View/UI/FreezeButton';

export interface IFreezePluginConfig {}

export class FreezePlugin extends Plugin {
    SheetPlugin: any;

    constructor(config?: IFreezePluginConfig) {
        super(FROZEN_PLUGIN_NAME);
    }

    static create(config?: IFreezePluginConfig) {
        return new FreezePlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });
        const config: IConfig = {};

        const item: IToolbarItemProps = {
            locale: FROZEN_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <FreezeButton config={config} />,
        };
        // get spreadsheet plugin
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.sheetPlugin?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
