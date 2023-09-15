import { IDocumentSkeletonPage, ISkeletonResourceReference } from '../Basics/IDocumentSkeletonCached';
import { ISectionBreakConfig } from '../Basics/Interfaces';
import { BlockPlugin } from './BlockPlugin';
import { BulletPlugin } from './BulletPlugin';

const DOCUMENT_CUSTOM_BLOCK = 'documentCustomBlock';
const DOCUMENT_CUSTOM_BULLET = 'documentCustomBullet';

export function dealWidthCustomBlock(
    blockId: string,
    custom: unknown,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference
) {
    if (!context) {
        return [];
    }
    const blockPlugin = context.getPluginManager().getPluginByName<BlockPlugin>(DOCUMENT_CUSTOM_BLOCK);
    if (blockPlugin) {
        return blockPlugin.dealWidthCustomBlock(blockId, custom, curPage, sectionBreakConfig, skeletonResourceReference);
    }
    return [];
}

export function dealWidthCustomBulletOrderedSymbol(startIndex: number, startNumber: number, glyphType: string) {
    if (!context) {
        return '';
    }
    const bulletPlugin = context.getPluginManager().getPluginByName<BulletPlugin>(DOCUMENT_CUSTOM_BULLET);
    if (bulletPlugin) {
        return bulletPlugin.dealWidthCustomBulletOrderedSymbol(startIndex, startNumber, glyphType);
    }
    return '';
}
