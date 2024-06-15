/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommand, IMutationInfo, IObjectPositionH, IObjectPositionV, JSONXActions, WrapTextType } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';

export enum TextWrappingStyle {
    INLINE = 'inline',
    BEHIND_TEXT = 'behindText',
    IN_FRONT_OF_TEXT = 'inFrontOfText',
    WRAP_SQUARE = 'wrapSquare',
    WRAP_TOP_AND_BOTTOM = 'wrapTopAndBottom',
}

const WRAPPING_STYLE_TO_LAYOUT_TYPE = {
    [TextWrappingStyle.INLINE]: PositionedObjectLayoutType.INLINE,
    [TextWrappingStyle.WRAP_SQUARE]: PositionedObjectLayoutType.WRAP_SQUARE,
    [TextWrappingStyle.WRAP_TOP_AND_BOTTOM]: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    [TextWrappingStyle.IN_FRONT_OF_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
    [TextWrappingStyle.BEHIND_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
};

interface IUpdateDocDrawingWrappingStyleParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    wrappingStyle: TextWrappingStyle;
}

/**
 * The command to update drawing wrapping style.
 */
export const UpdateDocDrawingWrappingStyleCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-wrapping-style',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor: IAccessor, params?: IUpdateDocDrawingWrappingStyleParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);

        const docsSkeletonObject = docSkeletonManagerService.getCurrent();
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null || docsSkeletonObject == null) {
            return false;
        }

        const { drawings, wrappingStyle, unitId } = params;

        if (docsSkeletonObject.unitId !== unitId) {
            return false;
        }

        const { skeleton } = docsSkeletonObject;
        const skeletonData = skeleton.getSkeletonData();

        if (skeletonData == null) {
            return false;
        }

        const { pages } = skeletonData;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId } = drawing;

            // Update layoutType.
            const oldLayoutType = oldDrawings[drawingId].layoutType;
            const newLayoutType = WRAPPING_STYLE_TO_LAYOUT_TYPE[wrappingStyle];

            if (oldLayoutType !== newLayoutType) {
                const updateLayoutTypeAction = jsonX.replaceOp(['drawings', drawingId, 'layoutType'], oldLayoutType, newLayoutType);

                rawActions.push(updateLayoutTypeAction!);
            }

            // Update behindDoc if layoutType is WRAP_NONE.
            if (wrappingStyle === TextWrappingStyle.BEHIND_TEXT || wrappingStyle === TextWrappingStyle.IN_FRONT_OF_TEXT) {
                const oldBehindDoc = oldDrawings[drawingId].behindDoc;
                const newBehindDoc = wrappingStyle === TextWrappingStyle.BEHIND_TEXT ? BooleanNumber.TRUE : BooleanNumber.FALSE;

                if (oldBehindDoc !== newBehindDoc) {
                    const updateBehindDocAction = jsonX.replaceOp(['drawings', drawingId, 'behindDoc'], oldBehindDoc, newBehindDoc);

                    rawActions.push(updateBehindDocAction!);
                }
            }

            if (wrappingStyle === TextWrappingStyle.INLINE) {
                continue;
            }

            // Update positionH and positionV if layoutType is not inline.
            let skeDrawing = null;
            let pageMarginTop = 0;
            let pageMarginLeft = 0;
            for (const page of pages) {
                if (page.skeDrawings.has(drawingId)) {
                    skeDrawing = page.skeDrawings.get(drawingId);
                    pageMarginTop = page.marginTop;
                    pageMarginLeft = page.marginLeft;
                    break;
                }
            }

            if (skeDrawing != null) {
                const { aTop, aLeft } = skeDrawing;
                const oldPositionH = oldDrawings[drawingId].docTransform.positionH;
                let posOffsetH = aLeft;

                if (oldPositionH.relativeFrom === ObjectRelativeFromH.MARGIN) {
                    posOffsetH -= pageMarginLeft;
                } else if (oldPositionH.relativeFrom === ObjectRelativeFromH.COLUMN) {
                    posOffsetH -= skeDrawing.columnLeft;
                }

                const newPositionH = {
                    relativeFrom: oldPositionH.relativeFrom,
                    posOffset: posOffsetH,
                };

                if (oldPositionH.posOffset !== newPositionH.posOffset) {
                    const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionH'], oldPositionH, newPositionH);

                    rawActions.push(action!);
                }

                const oldPositionV = oldDrawings[drawingId].docTransform.positionV;
                let posOffsetV = aTop;

                if (oldPositionV.relativeFrom === ObjectRelativeFromV.PAGE) {
                    posOffsetV += pageMarginTop;
                } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.LINE) {
                    posOffsetV -= skeDrawing.lineTop;
                } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
                    posOffsetV -= skeDrawing.blockAnchorTop;
                }

                const newPositionV = {
                    relativeFrom: oldPositionV.relativeFrom,
                    posOffset: posOffsetV,
                };

                if (oldPositionV.posOffset !== newPositionV.posOffset) {
                    const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionV'], oldPositionV, newPositionV);

                    rawActions.push(action!);
                }
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IDist {
    distT: number;
    distB: number;
    distL: number;
    distR: number;
}

interface IUpdateDocDrawingDistanceParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    dist: IDist;
}

/**
 * The command to update drawing wrap text.
 */
export const UpdateDocDrawingDistanceCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-distance',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDocDrawingDistanceParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, dist, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        for (const drawing of drawings) {
            const { drawingId } = drawing;

            for (const [key, value] of Object.entries(dist)) {
                const oldValue = oldDrawings[drawingId][key as keyof IDist];

                if (oldValue !== value) {
                    const action = jsonX.replaceOp(['drawings', drawingId, key], oldValue, value);

                    rawActions.push(action!);
                }
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IUpdateDocDrawingWrapTextParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    wrapText: WrapTextType;
}

/**
 * The command to update drawing wrap text.
 */
export const UpdateDocDrawingWrapTextCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-wrap-text',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDocDrawingWrapTextParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, wrapText, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId } = drawing;

            const oldWrapText = oldDrawings[drawingId].wrapText;

            if (oldWrapText !== wrapText) {
                const action = jsonX.replaceOp(['drawings', drawingId, 'wrapText'], oldWrapText, wrapText);

                rawActions.push(action!);
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface IDrawingPosition {
    drawingId: string;
    direction: 'positionH' | 'positionV';
    position: IObjectPositionH | IObjectPositionV;
}

export interface IUpdateDocDrawingPositionParams {
    unitId: string;
    subUnitId: string;
    drawings: IDrawingPosition[];
}

/**
 * The command to update drawing position.
 */
export const UpdateDocDrawingPositionCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-position',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDocDrawingPositionParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId, direction, position } = drawing;

            const oldPosition = oldDrawings[drawingId].docTransform[direction];

            if (oldPosition.relativeFrom !== position.relativeFrom || oldPosition.posOffset !== position.posOffset) {
                const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', direction], oldPosition, position);

                rawActions.push(action!);
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
