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

import type {
    IBorderData,
    IColorStyle,
    IDocumentData,
    IKeyValue,
    IStyleBase,
    ITextDecoration,
    ITransformState,
    LocaleService,
    Nullable,
} from '@univerjs/core';
import { BooleanNumber, DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentDataModel } from '@univerjs/core';

import { BaseObject } from '../base-object';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../basics/interfaces';
import type { IViewportInfo } from '../basics/vector2';
import { DocumentSkeleton } from '../components/docs/layout/doc-skeleton';
import { Documents } from '../components/docs/document';
import { DocumentViewModel } from '../components/docs/view-model/document-view-model';
import type { UniverRenderingContext } from '../context';

export interface IRichTextProps extends ITransformState, IStyleBase {
    text?: string;
    richText?: IDocumentData;
    zIndex: number;
    forceRender?: boolean;
}

export const RICHTEXT_OBJECT_ARRAY = ['text', 'richText'];

export class RichText extends BaseObject {
    private _documentData!: IDocumentData;

    private _documentSkeleton!: DocumentSkeleton;

    private _documents!: Documents;

    private _ff?: Nullable<string>;

    private _fs?: number = 12;

    private _it?: BooleanNumber = BooleanNumber.FALSE;

    private _bl?: BooleanNumber = BooleanNumber.FALSE;

    private _ul?: ITextDecoration = {
        s: BooleanNumber.FALSE,
    };

    private _st?: ITextDecoration = {
        s: BooleanNumber.FALSE,
    };

    private _ol?: ITextDecoration = {
        s: BooleanNumber.FALSE,
    };

    private _bg?: Nullable<IColorStyle>;

    private _bd?: Nullable<IBorderData>;

    private _cl?: Nullable<IColorStyle>;

    constructor(
        private _localeService: LocaleService,
        key?: string,
        props?: IRichTextProps
    ) {
        super(key);
        if (props?.richText) {
            this._documentData = props.richText;
        } else if (props) {
            this._fs = props.fs;
            this._ff = props.ff;
            this._it = props.it;
            this._bl = props.bl;
            this._ul = props.ul;
            this._st = props.st;
            this._ol = props.ol;
            this._bg = props.bg;
            this._bd = props.bd;
            this._cl = props.cl;

            this._documentData = this._convertToDocumentData(props.text || '');
        }

        const docModel = new DocumentDataModel(this._documentData);
        const docViewModel = new DocumentViewModel(docModel);

        this._documentSkeleton = DocumentSkeleton.create(docViewModel, this._localeService);

        this._documents = new Documents(`${this.oKey}_DOCUMENTS`, this._documentSkeleton, {
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        this._initialProps(props);

        this.onTransformChange$.subscribeEvent((changeState) => {
            const { type } = changeState;
            if (type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize || type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.all) {
                docModel.updateDocumentDataPageSize(this.width);
                this._documentSkeleton.makeDirty(true);
                this._documentSkeleton.calculate();
                const size = this.getDocsSkeletonPageSize();
                this.height = size?.height || this.height;
                this._setTransForm();
            }
        });
    }

    get documentData() {
        return this._documentData;
    }

    getDocsSkeletonPageSize() {
        const skeletonData = this._documentSkeleton?.getSkeletonData();

        if (!skeletonData) {
            return;
        }
        const { pages } = skeletonData;
        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage;

        return { width, height };
    }

    setProps(props?: IRichTextProps) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }
        themeKeys.forEach((key) => {
            // @ts-ignore
            if (props[key] === undefined) {
                return true;
            }

            if (RICHTEXT_OBJECT_ARRAY.indexOf(key) === -1) {
                // @ts-ignore
                this[`_${key}`] = props[key];
            }
        });
        this.makeDirty(true);
        return this;
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (this.isRender(bounds)) {
            const { top, left, bottom, right } = bounds!.viewBound;

            if (
                this.width + this.strokeWidth < left ||
                right < 0 ||
                this.height + this.strokeWidth < top ||
                bottom < 0
            ) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._draw(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    override toJson() {
        const props: IKeyValue = {};
        RICHTEXT_OBJECT_ARRAY.forEach((key) => {
            // @ts-ignore
            if (this[key]) {
                // @ts-ignore
                props[key] = this[key];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    protected _draw(ctx: UniverRenderingContext) {
        this._documents.render(ctx);
    }

    private _convertToDocumentData(text: string) {
        const contentLength = text.length;
        const documentData: IDocumentData = {
            id: 'd',
            body: {
                dataStream: `${text}${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
                textRuns: [
                    {
                        ts: {
                            fs: this._fs || 14,
                            ff: this._ff,
                            it: this._it,
                            bl: this._bl,
                            ul: this._ul,
                            st: this._st,
                            ol: this._ol,
                            bg: this._bg,
                            bd: this._bd,
                            cl: this._cl,
                        },
                        st: 0,
                        ed: contentLength,
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: Number.POSITIVE_INFINITY,
                    height: Number.POSITIVE_INFINITY,
                },
            },
        };

        return documentData;
    }

    private _initialProps(props?: IRichTextProps) {
        this._documentSkeleton
            .getViewModel()
            .getDataModel()
            .updateDocumentDataPageSize(props?.width, props?.height);

        this._documentSkeleton.calculate();

        const contentSize = this.getDocsSkeletonPageSize();

        this.transformByState({
            width: contentSize?.width || 0,
            height: contentSize?.height || 0,
            left: props?.left || 0,
            top: props?.top || 0,
            angle: props?.angle,
        });

        this.setProps(props);

        this.makeDirty(true);
    }
}
