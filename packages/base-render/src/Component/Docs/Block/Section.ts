import { DataStreamTreeNode, DataStreamTreeNodeType, DocumentBodyModel } from '@univerjs/core';

import { IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../Basics/IDocumentSkeletonCached';
import { ISectionBreakConfig } from '../../../Basics/Interfaces';
import { dealWithBlockError } from './BlockError';
// eslint-disable-next-line import/no-cycle
import { dealWidthParagraph } from './Paragraph';

export function dealWithSections(
    bodyModel: DocumentBodyModel,
    sectionNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    preRenderedBlockIdMap?: Map<string, boolean>
) {
    const allCurrentSkeletonPages: IDocumentSkeletonPage[] = [];
    const renderedBlockIdMap = new Map<string, boolean>();
    for (const node of sectionNode.children) {
        // const { paragraph, table, tableOfContents, blockType, customBlock, blockId } = block;
        // if (preRenderedBlockIdMap?.get(blockId)) {
        //     continue;
        // }
        let skeletonPages: IDocumentSkeletonPage[] = [];
        let currentPageCache = curPage;
        if (allCurrentSkeletonPages.length > 0) {
            currentPageCache = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
        }
        if (node.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
            // Paragraph 段落
            skeletonPages = dealWidthParagraph(bodyModel, node, currentPageCache, sectionBreakConfig, skeletonResourceReference);
        } else if (node.nodeType === DataStreamTreeNodeType.TABLE) {
            // Table 表格
        }

        if (skeletonPages.length === 0) {
            skeletonPages = dealWithBlockError();
        }

        _pushPage(allCurrentSkeletonPages, skeletonPages);

        // renderedBlockIdMap.set(blockId, true);
    }

    return {
        pages: allCurrentSkeletonPages,
        renderedBlockIdMap,
    };
}

function _pushPage(allCurrentSkeletonPages: IDocumentSkeletonPage[], blockSkeletonPages: IDocumentSkeletonPage[]) {
    const lastIndex = allCurrentSkeletonPages.length - 1;
    const lastOldPage = allCurrentSkeletonPages[lastIndex];
    const firstNewPage = blockSkeletonPages[0];

    if (lastOldPage === firstNewPage) {
        blockSkeletonPages.splice(0, 1);
    }

    allCurrentSkeletonPages.push(...blockSkeletonPages);
}

// 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
export function dealWidthBlocksByMultiColumnAndContinuous() {}
