import { DocPlugin } from '@univerjs/base-docs';
import { RenderEngine } from '@univerjs/base-render';
import { UIPlugin } from '@univerjs/base-ui';
import { DEFAULT_DOCUMENT_DATA_EN } from '@univerjs/common-plugin-data';
import { LocaleType, Univer } from '@univerjs/core';
import { greenTheme } from '@univerjs/design';
import { DocUIPlugin } from '@univerjs/ui-plugin-docs';

// univer
const univer = new Univer({
    theme: greenTheme,
    locale: LocaleType.EN,
});

// core plugins
univer.registerPlugin(RenderEngine);
univer.registerPlugin(UIPlugin, {
    container: 'univer-container',
    header: true,
    toolbar: true,
});
univer.registerPlugin(DocPlugin, {
    standalone: true,
});
univer.registerPlugin(DocUIPlugin, {
    container: 'univerdoc',
    layout: {
        docContainerConfig: {
            innerLeft: false,
        },
    },
});

univer.createUniverDoc(DEFAULT_DOCUMENT_DATA_EN);
