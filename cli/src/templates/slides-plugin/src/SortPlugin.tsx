import { Plugin, SlideContext, UniverSlide } from '@univerjs/core';
import { zh, en } from './Locale';
import { <%= projectConstantValue %>_PLUGIN_NAME} from './Basics/Const/PLUGIN_NAME'
import { <%= projectUpperValue %>Controller } from './Controller/<%= projectUpperValue %>Controller';

export interface I<%= projectUpperValue %>PluginConfig {}

export class <%= projectUpperValue %>Plugin extends Plugin<any, SlideContext> {
    private _<%= projectValue %>Controller: <%= projectUpperValue %>Controller;

    constructor(config ?: I<%= projectUpperValue %>PluginConfig) {
        super(<%= projectConstantValue %>_PLUGIN_NAME);
    }

    static create(config?: I<%= projectUpperValue %>PluginConfig) {
        return new <%= projectUpperValue %>Plugin(config);
    }

    installTo(universheetInstance: UniverSlide) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {

        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._<%= projectValue %>Controller = new <%= projectUpperValue %>Controller(this);
    }

    onRendered(): void {
        this.initialize()
    }

    onDestroy(): void {}
}
