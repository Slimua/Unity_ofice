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

import type { DocumentDataModel, ICommandInfo, IDocDrawingPosition, Nullable } from '@univerjs/core';
import { BooleanNumber, Disposable, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IImageIoServiceParam } from '@univerjs/drawing';
import { DRAWING_IMAGE_ALLOW_SIZE, DRAWING_IMAGE_COUNT_LIMIT, DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT, DrawingTypeEnum, getDrawingShapeKeyByDrawingSearch, getImageSize, IDrawingManagerService, IImageIoService, ImageUploadStatusType } from '@univerjs/drawing';
import { IMessageService } from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { DocSkeletonManagerService, RichTextEditingMutation, TextSelectionManagerService } from '@univerjs/docs';
import { docDrawingPositionToTransform } from '@univerjs/docs-ui';
import type { Documents, Image, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DocumentEditArea, IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';

import type { IInsertImageOperationParams } from '../../commands/operations/insert-image.operation';
import { InsertDocImageOperation } from '../../commands/operations/insert-image.operation';
import type { IInsertDrawingCommandParams } from '../../commands/commands/interfaces';
import { type ISetDrawingArrangeCommandParams, SetDocDrawingArrangeCommand } from '../../commands/commands/set-drawing-arrange.command';
import { InsertDocDrawingCommand } from '../../commands/commands/insert-doc-drawing.command';
import { GroupDocDrawingCommand } from '../../commands/commands/group-doc-drawing.command';
import { UngroupDocDrawingCommand } from '../../commands/commands/ungroup-doc-drawing.command';

export class DocDrawingUpdateRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManager: TextSelectionManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager
    ) {
        super();

        this._initCommandListeners();
        this._updateDrawingListener();
        this._updateOrderListener();
        this._groupDrawingListener();
        this._focusDrawingListener();

        this._editAreaChangeListener();
    }

    /**
     * Upload image to cell or float image
     */
    private _initCommandListeners() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === InsertDocImageOperation.id) {
                    const params = command.params as IInsertImageOperationParams;
                    if (params.files == null) {
                        return;
                    }

                    const fileLength = params.files.length;

                    if (fileLength > DRAWING_IMAGE_COUNT_LIMIT) {
                        this._messageService.show({
                            type: MessageType.Error,
                            content: this._localeService.t('update-status.exceedMaxCount', String(DRAWING_IMAGE_COUNT_LIMIT)),
                        });
                        return;
                    }

                    this._imageIoService.setWaitCount(fileLength);

                    await this._insertFloatImages(params.files);
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private async _insertFloatImages(files: File[]) {
        let imageParams: Nullable<IImageIoServiceParam>[] = [];

        try {
            imageParams = await Promise.all(files.map((file) => this._imageIoService.saveImage(file)));
        } catch (error) {
            const type = (error as Error).message;
            let content = '';

            switch (type) {
                case ImageUploadStatusType.ERROR_EXCEED_SIZE:
                    content = this._localeService.t('update-status.exceedMaxSize', String(DRAWING_IMAGE_ALLOW_SIZE / (1024 * 1024)));
                    break;
                case ImageUploadStatusType.ERROR_IMAGE_TYPE:
                    content = this._localeService.t('update-status.invalidImageType');
                    break;
                case ImageUploadStatusType.ERROR_IMAGE:
                    content = this._localeService.t('update-status.invalidImage');
                    break;
                default:
                    break;
            }

            this._messageService.show({
                type: MessageType.Error,
                content,
            });
        }

        if (imageParams.length === 0) {
            return;
        }

        const { unitId } = this._context;
        const docDrawingParams: IDocDrawing[] = [];

        for (const imageParam of imageParams) {
            if (imageParam == null) {
                continue;
            }
            const { imageId, imageSourceType, source, base64Cache } = imageParam;
            const { width, height, image } = await getImageSize(base64Cache || '');

            this._imageIoService.addImageSourceCache(imageId, imageSourceType, image);

            let scale = 1;
            if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
                const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
                const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
                scale = Math.min(scaleWidth, scaleHeight);
            }

            const docTransform = this._getImagePosition(width * scale, height * scale);

            if (docTransform == null) {
                return;
            }

            const docDrawingParam: IDocDrawing = {
                unitId,
                subUnitId: unitId,
                drawingId: imageId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                imageSourceType,
                source,
                transform: docDrawingPositionToTransform(docTransform),
                docTransform,
                behindDoc: BooleanNumber.FALSE,
                title: '',
                description: '',
                layoutType: PositionedObjectLayoutType.INLINE, // Insert inline drawing by default.
                wrapText: WrapTextType.BOTH_SIDES,
                distB: 0,
                distL: 0,
                distR: 0,
                distT: 0,
            };

            const isInHeaderFooter = this._isInsertInHeaderFooter();

            if (isInHeaderFooter) {
                docDrawingParam.isMultiTransform = BooleanNumber.TRUE;
                docDrawingParam.transforms = docDrawingParam.transform ? [docDrawingParam.transform] : null;
            }

            docDrawingParams.push(docDrawingParam);
        }

        this._commandService.executeCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: docDrawingParams,
        } as IInsertDrawingCommandParams);
    }

    private _isInsertInHeaderFooter() {
        const { unitId } = this._context;
        const viewModel = this._renderManagerSrv.getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getViewModel();

        const editArea = viewModel?.getEditArea();

        return editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER;
    }

    private _getImagePosition(
        imageWidth: number, imageHeight: number
    ): Nullable<IDocDrawingPosition> {
        const activeTextRange = this._textSelectionManagerService.getActiveTextRange();
        const position = activeTextRange?.getAbsolutePosition() || {
            left: 0,
            top: 0,
        };

        return {
            size: {
                width: imageWidth,
                height: imageHeight,
            },
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: position.left,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.MARGIN,
                posOffset: position.top,
            },
            angle: 0,
        };
    }

    private _updateOrderListener() {
        this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
            const { unitId, subUnitId, drawingIds, arrangeType } = params;

            this._commandService.executeCommand(SetDocDrawingArrangeCommand.id, {
                unitId,
                subUnitId,
                drawingIds,
                arrangeType,
            } as ISetDrawingArrangeCommandParams);
        });
    }

    private _updateDrawingListener() {
        this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
            // REFACTOR: @JOCS  需要修改，移除 transformer 修改，不需要跟新了，单独处理了。
            // 确认下还需要监听这个吗？
        });
    }

    private _groupDrawingListener() {
        this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(GroupDocDrawingCommand.id, params);
        });

        this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupDocDrawingCommand.id, params);
        });
    }

    private _getCurrentSceneAndTransformer() {
        const { scene, mainComponent } = this._context;

        if (scene == null || mainComponent == null) {
            return;
        }

        const transformer = scene.getTransformerByCreate();

        const { docsLeft, docsTop } = (mainComponent as Documents).getOffsetConfig();

        return { scene, transformer, docsLeft, docsTop };
    }

    private _focusDrawingListener() {
        this.disposeWithMe(
            this._drawingManagerService.focus$.subscribe((params) => {
                const { transformer, docsLeft, docsTop } = this._getCurrentSceneAndTransformer() ?? {};
                if (params == null || params.length === 0) {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    this._docDrawingService.focusDrawing([]);

                    if (transformer) {
                        transformer.resetProps({
                            zeroTop: 0,
                            zeroLeft: 0,
                        });
                    }
                } else {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
                    this._docDrawingService.focusDrawing(params);
                    // Need to remove text selections when focus drawings.
                    this._textSelectionManager.replaceTextRanges([]);
                    // this._textSelectionRenderManager.blur();

                    const prevSegmentId = this._textSelectionRenderManager.getSegment();
                    const segmentId = this._findSegmentIdByDrawingId(params[0].drawingId);

                    // Change segmentId when click drawing in different segment.
                    if (prevSegmentId !== segmentId) {
                        this._textSelectionRenderManager.setSegment(segmentId);
                    }

                    if (transformer) {
                        transformer.resetProps({
                            zeroTop: docsTop,
                            zeroLeft: docsLeft,
                        });
                    }
                }
            })
        );
    }

    private _findSegmentIdByDrawingId(drawingId: string) {
        const { unit: DocDataModel } = this._context;

        const { body, headers = {}, footers = {} } = DocDataModel.getSnapshot();

        const bodyCustomBlocks = body?.customBlocks ?? [];

        if (bodyCustomBlocks.some((b) => b.blockId === drawingId)) {
            return '';
        }

        for (const headerId of Object.keys(headers)) {
            if (headers[headerId].body.customBlocks?.some((b) => b.blockId === drawingId)) {
                return headerId;
            }
        }

        for (const footerId of Object.keys(footers)) {
            if (footers[footerId].body.customBlocks?.some((b) => b.blockId === drawingId)) {
                return footerId;
            }
        }

        return '';
    }

    // Update drawings edit status and opacity. You can not edit header footer images when you are editing body. and vice verse.
    private _updateDrawingsEditStatus() {
        const { unit: docDataModel, scene, unitId } = this._context;
        const viewModel = this._renderManagerSrv
            .getRenderById(unitId)
            ?.with(DocSkeletonManagerService).getViewModel();

        if (viewModel == null || docDataModel == null) {
            return;
        }

        const snapshot = docDataModel.getSnapshot();
        const { drawings = {} } = snapshot;
        const isEditBody = viewModel.getEditArea() === DocumentEditArea.BODY;

        for (const key of Object.keys(drawings)) {
            const drawing = drawings[key];
            const objectKey = getDrawingShapeKeyByDrawingSearch({ unitId, drawingId: drawing.drawingId, subUnitId: unitId });
            const drawingShapes = scene.fuzzyMathObjects(objectKey, true);

            if (drawingShapes.length) {
                for (const shape of drawingShapes) {
                    scene.detachTransformerFrom(shape);
                    (shape as Image).setOpacity(0.5);
                    if (
                        (isEditBody && drawing.isMultiTransform !== BooleanNumber.TRUE)
                        || (!isEditBody && drawing.isMultiTransform === BooleanNumber.TRUE)
                    ) {
                        scene.attachTransformerTo(shape);
                        (shape as Image).setOpacity(1);
                    }
                }
            }
        }
    }

    private _editAreaChangeListener() {
        const { unitId } = this._context;
        const viewModel = this._renderManagerSrv
            .getRenderById(unitId)
            ?.with(DocSkeletonManagerService).getViewModel();

        if (viewModel == null) {
            return;
        }

        this._updateDrawingsEditStatus();

        this.disposeWithMe(
            viewModel.editAreaChange$.subscribe(() => {
                this._updateDrawingsEditStatus();
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === RichTextEditingMutation.id) {
                    // To wait the image is rendered.
                    queueMicrotask(() => {
                        this._updateDrawingsEditStatus();
                    });
                }
            })
        );
    }
}
