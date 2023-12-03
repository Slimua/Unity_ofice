import numfmt from '@univerjs/base-numfmt-engine';
import type { FormatType } from '@univerjs/base-sheets';

export const getPatternType = (pattern: string): FormatType => numfmt.getInfo(pattern).type || 'unknown';
export const getPatternPreview = (pattern: string, value: number) => {
    const info = numfmt.getInfo(pattern);

    const negInfo = info._partitions[1];
    const result = numfmt.format(pattern, value, { locale: 'zh-CN' });
    if (value < 0) {
        return {
            result,
            color: negInfo.color,
        };
    }
    return {
        result,
    };
};
