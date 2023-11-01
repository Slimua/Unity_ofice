import {
    DataStreamTreeTokenType,
    horizontalLineSegmentsSubtraction,
    ICustomBlock,
    ICustomRange,
    IDocumentBody,
    IParagraph,
    ISectionBreak,
    isSameStyleTextRun,
    ITable,
    ITextRun,
    Nullable,
    sortRulesFactory,
} from '@univerjs/core';

/**
 * Inserting styled text content into the current document model.
 * @param body The current content object of the document model.
 * @param insertBody The newly added content object that includes complete text and textRun style information.
 * @param textLength The length of the inserted content text.
 * @param currentIndex Determining the index where the content will be inserted into the current content.
 */
export function insertTextRuns(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { textRuns } = body;

    if (textRuns == null) {
        return;
    }

    let insertIndex = Infinity; // The current index of the textRun where the insertion needs to be made.
    for (let i = 0, len = textRuns.length; i < len; i++) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;

        if (st >= currentIndex) {
            textRun.st += textLength;
            textRun.ed += textLength;

            if (insertIndex === Infinity) {
                insertIndex = -Infinity;
            }
        } else if (ed >= currentIndex) {
            /**
             * Inserting text at the end of a rich text content,
             * with the newly inserted text inheriting the style of that content.
             * So, it is necessary to set ed >= currentIndex - 1 to ensure that the new text is inserted while maintaining the style of the existing content.
             */
            textRun.ed += textLength;
            if (!Number.isFinite(insertIndex)) {
                insertIndex = i;
            }
        }
    }

    const insertTextRuns = insertBody.textRuns;

    if (insertTextRuns) {
        for (let i = 0, len = insertTextRuns.length; i < len; i++) {
            const insertTextRun = insertTextRuns[i];
            insertTextRun.st += currentIndex;
            insertTextRun.ed += currentIndex;
        }

        if (insertIndex === Infinity) {
            textRuns.push(...insertTextRuns);
        }
        if (insertIndex === -Infinity) {
            textRuns.unshift(...insertTextRuns);
        } else {
            const splitTextRun = textRuns[insertIndex];
            const { st, ed } = splitTextRun;

            const startSplitTextRun = {
                ...splitTextRun,
                st,
                ed: insertTextRuns[0].st,
            };

            if (isSameStyleTextRun(startSplitTextRun, insertTextRuns[0])) {
                startSplitTextRun.ed = insertTextRuns[0].ed;
                insertTextRuns.shift();
            }

            const lastInsertTextRuns = insertTextRuns[insertTextRuns.length - 1];

            if (!lastInsertTextRuns) {
                textRuns.splice(insertIndex, 1, startSplitTextRun);

                return;
            }

            if (lastInsertTextRuns.ed === ed) {
                textRuns.splice(insertIndex, 1, startSplitTextRun, ...insertTextRuns);

                return;
            }

            const endSplitTextRun = {
                ...splitTextRun,
                st: lastInsertTextRuns.ed,
                ed,
            };

            if (isSameStyleTextRun(endSplitTextRun, lastInsertTextRuns)) {
                endSplitTextRun.st = lastInsertTextRuns.st;
                insertTextRuns.pop();
            }

            textRuns.splice(insertIndex, 1, startSplitTextRun, ...insertTextRuns, endSplitTextRun);
        }
    }
}

/**
 * Based on the insertBody parameter, which includes a paragraph object,
 * you can add and adjust the position of paragraphs.
 * @param body The current content object of the document model.
 * @param insertBody The newly added content object that includes paragraph information.
 * @param textLength The length of the inserted content text.
 * @param currentIndex Determining the index where the content will be inserted into the current content.
 */
export function insertParagraphs(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { paragraphs } = body;

    if (paragraphs == null) {
        return;
    }

    const { paragraphs: insertParagraphs, dataStream: insertDataStream } = insertBody;

    const paragraphIndexList = [];
    let firstInsertParagraphNextIndex = -1;
    for (let i = 0, len = paragraphs.length; i < len; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;
        if (startIndex >= currentIndex) {
            paragraph.startIndex += textLength;
        }

        if (firstInsertParagraphNextIndex === -1 && startIndex > currentIndex) {
            firstInsertParagraphNextIndex = i;
        }

        paragraphIndexList.push(paragraph.startIndex);
    }

    let deleteReptIndex = -1;
    if (insertParagraphs) {
        for (let i = 0, len = insertParagraphs.length; i < len; i++) {
            const insertParagraph = insertParagraphs[i];
            insertParagraph.startIndex += currentIndex;
            const insertIndex = insertParagraph.startIndex;
            deleteReptIndex = paragraphIndexList.indexOf(insertIndex);
        }

        if (insertDataStream === DataStreamTreeTokenType.PARAGRAPH && insertParagraphs.length === 1) {
            const nextParagraph = paragraphs[firstInsertParagraphNextIndex];
            const insertParagraph = insertParagraphs[0];

            const nextParagraphStyle = nextParagraph.paragraphStyle;
            const nextBullet = nextParagraph.bullet;

            nextParagraph.paragraphStyle = insertParagraph.paragraphStyle;
            nextParagraph.bullet = insertParagraph.bullet;

            insertParagraph.paragraphStyle = nextParagraphStyle;
            insertParagraph.bullet = nextBullet;
        }

        if (deleteReptIndex !== -1) {
            paragraphs.splice(deleteReptIndex, 1);
        }

        paragraphs.push(...insertParagraphs);
        paragraphs.sort(sortRulesFactory('startIndex'));
    }
}

export function insertSectionBreaks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { sectionBreaks } = body;

    if (sectionBreaks == null) {
        return;
    }

    for (let i = 0, len = sectionBreaks.length; i < len; i++) {
        const sectionBreak = sectionBreaks[i];
        const { startIndex } = sectionBreak;
        if (startIndex >= currentIndex) {
            /**
             * Here, startIndex >= currentIndex means that the starting index of
             * the new paragraph should be greater than or equal to the current index.
             * This ensures that the paragraph is inserted at a position after the current paragraph.
             * However, the accuracy of this condition depends on the specific context and
             * implementation details, so it would be best to validate it further in your specific scenario.
             */
            sectionBreak.startIndex += textLength;
        }
    }

    const insertSectionBreaks = insertBody.sectionBreaks;
    if (insertSectionBreaks) {
        for (let i = 0, len = insertSectionBreaks.length; i < len; i++) {
            const sectionBreak = insertSectionBreaks[i];
            sectionBreak.startIndex += currentIndex;
        }

        sectionBreaks.push(...insertSectionBreaks);
        sectionBreaks.sort(sortRulesFactory('startIndex'));
    }
}

export function insertCustomBlocks(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { customBlocks } = body;

    if (customBlocks == null) {
        return;
    }

    for (let i = 0, len = customBlocks.length; i < len; i++) {
        const customBlock = customBlocks[i];
        const { startIndex } = customBlock;
        if (startIndex >= currentIndex) {
            customBlock.startIndex += textLength;
        }
    }

    const insertCustomBlocks = insertBody.customBlocks;
    if (insertCustomBlocks) {
        for (let i = 0, len = insertCustomBlocks.length; i < len; i++) {
            const customBlock = insertCustomBlocks[i];
            customBlock.startIndex += currentIndex;
        }

        customBlocks.push(...insertCustomBlocks);
        customBlocks.sort(sortRulesFactory('startIndex'));
    }
}

export function insertTables(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
    const { tables } = body;

    if (tables == null) {
        return;
    }

    for (let i = 0, len = tables.length; i < len; i++) {
        const table = tables[i];
        const { startIndex, endIndex } = table;
        if (startIndex > currentIndex) {
            table.startIndex += textLength;
            table.endIndex += textLength;
        } else if (endIndex >= currentIndex - 1) {
            table.endIndex += textLength;
        }
    }

    const insertTables = insertBody.tables;
    if (insertTables) {
        for (let i = 0, len = insertTables.length; i < len; i++) {
            const table = insertTables[i];
            table.startIndex += currentIndex;
            table.endIndex += currentIndex;
        }

        tables.push(...insertTables);
        tables.sort(sortRulesFactory('startIndex'));
    }
}

export function insertCustomRanges(
    body: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    const { customRanges } = body;

    if (customRanges == null) {
        return;
    }

    for (let i = 0, len = customRanges.length; i < len; i++) {
        const customRange = customRanges[i];
        const { startIndex, endIndex } = customRange;
        if (startIndex > currentIndex) {
            customRange.startIndex += textLength;
            customRange.endIndex += textLength;
        } else if (endIndex >= currentIndex - 1) {
            customRange.endIndex += textLength;
        }
    }

    const insertCustomRanges = insertBody.customRanges;
    if (insertCustomRanges) {
        for (let i = 0, len = insertCustomRanges.length; i < len; i++) {
            const customRange = insertCustomRanges[i];
            customRange.startIndex += currentIndex;
            customRange.endIndex += currentIndex;
        }

        customRanges.push(...insertCustomRanges);
        customRanges.sort(sortRulesFactory('startIndex'));
    }
}

export function deleteTextRuns(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { textRuns } = body;
    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength;
    const removeTextRuns: ITextRun[] = [];

    if (textRuns) {
        const newTextRuns = [];

        for (let i = 0, len = textRuns.length; i < len; i++) {
            const textRun = textRuns[i];
            const { st, ed } = textRun;

            if (startIndex <= st && endIndex >= ed) {
                /**
                 * If the selection range is larger than the current textRuns, it needs to be deleted.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: st - startIndex,
                    ed: ed - startIndex,
                });
                continue;
            } else if (st <= startIndex && ed >= endIndex) {
                /**
                 * If the selection range is smaller than the current textRun,
                 * it needs to be trimmed. After trimming, the two segments of textRun should be merged.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: startIndex - startIndex,
                    ed: endIndex - startIndex,
                });
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex - 1);

                textRun.st = segments[0];
                textRun.ed = segments[1];
            } else if (startIndex >= st && startIndex < ed) {
                /**
                 * If the cursor start position is within the textRun,
                 * the content on the right side of the textRun needs to be removed,
                 * leaving the content on the left
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: startIndex - startIndex,
                    ed: ed - startIndex,
                });
                textRun.ed = startIndex;
            } else if (endIndex > st && endIndex <= ed) {
                /**
                 * If the cursor end position is within the textRun,
                 * the content on the left side of the textRun needs to be removed,
                 * leaving the content on the right.
                 */
                removeTextRuns.push({
                    ...textRun,
                    st: st - startIndex,
                    ed: endIndex - startIndex,
                });
                textRun.st = endIndex - textLength;
                textRun.ed -= textLength;
            } else if (st >= endIndex) {
                /**
                 * TextRuns to the right of the selection content need to be moved as a whole
                 */
                textRun.st -= textLength;
                textRun.ed -= textLength;
            }

            newTextRuns.push(textRun);
        }

        body.textRuns = newTextRuns;
    }

    return removeTextRuns;
}

export function deleteParagraphs(
    body: IDocumentBody,
    textLength: number,
    currentIndex: number,
    closeRemoveAfterFirstNew = false
) {
    const { paragraphs } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeParagraphs: IParagraph[] = [];
    let removeAfterFirstNew: Nullable<IParagraph> = null;
    let isRemove = false;
    if (paragraphs) {
        const newParagraphs = [];
        for (let i = 0, len = paragraphs.length; i < len; i++) {
            const paragraph = paragraphs[i];
            const { startIndex: index } = paragraph;
            // if (startIndex === endIndex && endIndex === index) {
            //     const nextParagraph = paragraphs[i + 1];
            //     const isBullet = checkParagraphHasBullet(nextParagraph);
            //     const isIndent = checkParagraphHasIndent(nextParagraph);
            //     if (isBullet && nextParagraph != null) {
            //         delete nextParagraph.bullet;
            //     } else if (isIndent && nextParagraph != null) {
            //         delete nextParagraph.paragraphStyle?.hanging;
            //         delete nextParagraph.paragraphStyle?.indentStart;
            //     }
            // } else
            if (index >= startIndex && index <= endIndex) {
                removeParagraphs.push({
                    ...paragraph,
                    startIndex: index - currentIndex,
                });
                isRemove = true;
                continue;
            } else if (index > endIndex) {
                paragraph.startIndex -= textLength;
            }

            newParagraphs.push(paragraph);

            if (removeAfterFirstNew == null && isRemove) {
                removeAfterFirstNew = paragraph;
            }
        }
        if (removeAfterFirstNew != null && closeRemoveAfterFirstNew === false) {
            // When deleting a paragraph, the configuration of the paragraph
            // in the beginning range should be retained. Due to the label design,
            // the paragraph mark is located after the content, so when deleting,
            // it will surround the configuration of the end range. A position update is required,
            // and the undo time should also be considered Restoration of position
            const removeFirst = removeParagraphs[0];
            if (removeFirst) {
                const newInsert = { ...removeFirst };
                removeParagraphs.push(removeAfterFirstNew);
                newParagraphs.splice(newParagraphs.indexOf(removeAfterFirstNew), 1, newInsert);
                newInsert.startIndex = removeAfterFirstNew.startIndex;
                removeAfterFirstNew.startIndex += textLength - currentIndex;
            }
        }
        body.paragraphs = newParagraphs;
    }
    return removeParagraphs;
}

export function deleteSectionBreaks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { sectionBreaks } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeSectionBreaks: ISectionBreak[] = [];
    if (sectionBreaks) {
        const newSectionBreaks = [];
        for (let i = 0, len = sectionBreaks.length; i < len; i++) {
            const sectionBreak = sectionBreaks[i];
            const { startIndex: index } = sectionBreak;
            if (index >= startIndex && index <= endIndex) {
                removeSectionBreaks.push({
                    ...sectionBreak,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                sectionBreak.startIndex -= textLength;
            }

            newSectionBreaks.push(sectionBreak);
        }
        body.sectionBreaks = newSectionBreaks;
    }
    return removeSectionBreaks;
}

export function deleteCustomBlocks(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customBlocks } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeCustomBlocks: ICustomBlock[] = [];
    if (customBlocks) {
        const newCustomBlocks = [];
        for (let i = 0, len = customBlocks.length; i < len; i++) {
            const customBlock = customBlocks[i];
            const { startIndex: index } = customBlock;
            if (index >= startIndex && index <= endIndex) {
                removeCustomBlocks.push({
                    ...customBlock,
                    startIndex: index - currentIndex,
                });
                continue;
            } else if (index > endIndex) {
                customBlock.startIndex -= textLength;
            }

            newCustomBlocks.push(customBlock);
        }
        body.customBlocks = newCustomBlocks;
    }
    return removeCustomBlocks;
}

export function deleteTables(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { tables } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeTables: ITable[] = [];
    if (tables) {
        const newTables = [];
        for (let i = 0, len = tables.length; i < len; i++) {
            const table = tables[i];
            const { startIndex: st, endIndex: ed } = table;
            if (startIndex <= st && endIndex >= ed) {
                removeTables.push({
                    ...table,
                    startIndex: st - currentIndex,
                    endIndex: ed - currentIndex,
                });
                continue;
            } else if (st <= startIndex && ed >= endIndex) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                table.startIndex = segments[0];
                table.endIndex = segments[1];
            } else if (endIndex < st) {
                table.startIndex -= textLength;
                table.endIndex -= textLength;
            }
            newTables.push(table);
        }
        body.tables = newTables;
    }
    return removeTables;
}

export function deleteCustomRanges(body: IDocumentBody, textLength: number, currentIndex: number) {
    const { customRanges } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;
    const removeCustomRanges: ICustomRange[] = [];
    if (customRanges) {
        const newCustomRanges = [];
        for (let i = 0, len = customRanges.length; i < len; i++) {
            const customRange = customRanges[i];
            const { startIndex: st, endIndex: ed } = customRange;
            if (startIndex <= st && endIndex >= ed) {
                removeCustomRanges.push({
                    ...customRange,
                    startIndex: st - currentIndex,
                    endIndex: ed - currentIndex,
                });
                continue;
            } else if (st <= startIndex && ed >= endIndex) {
                const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

                customRange.startIndex = segments[0];
                customRange.endIndex = segments[1];
            } else if (endIndex < st) {
                customRange.startIndex -= textLength;
                customRange.endIndex -= textLength;
            }
            newCustomRanges.push(customRange);
        }
        body.customRanges = newCustomRanges;
    }
    return removeCustomRanges;
}
