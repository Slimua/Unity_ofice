import type { LocaleType } from '@univerjs/core';

import type { SlideContainerConfig } from './slide-container-config';
import type { SlideToolbarConfig } from './toolbar-config';

export interface ILayout {
    slideContainerConfig?: SlideContainerConfig;
    toolbarConfig?: SlideToolbarConfig;
}

export interface ISlidesUIPluginConfig {
    container?: HTMLElement | string;
    layout?: ILayout;
    locale?: LocaleType;
}
