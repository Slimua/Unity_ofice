import { ICustomComponentProps } from '@univerjs/base-ui';

import { COMPONENT_PREFIX } from '../const';

export const BORDER_PANEL_COMPONENT = `${COMPONENT_PREFIX}_BORDER_PANEL_COMPONENT`;

export interface IBorderPanelProps extends ICustomComponentProps<{ id: string; value: string | number }> {
    panelType: Array<{
        type: BorderPanelType;
        id: string;
    }>;
}

export enum BorderPanelType {
    POSITION = 'position',
    STYLE = 'style',
    COLOR = 'color',
}
