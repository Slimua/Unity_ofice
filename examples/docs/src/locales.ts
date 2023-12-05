import DocsPluginZhCN from '@univerjs/docs/locale/zh-CN';
import BaseUiZhCN from '@univerjs/ui/locale/zh-CN';
import DesignZH from '@univerjs/design/locale/zh-CN';
import DocsUIPluginZhCN from '@univerjs/docs-ui/locale/zh-CN';

export const locales = {
    zhCN: {
        ...DocsPluginZhCN,
        ...DocsUIPluginZhCN,
        ...BaseUiZhCN,
        ...DesignZH,
    },
};
