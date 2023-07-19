import { SlideContext } from '../../Basics/SlideContext';
import { DEFAULT_SLIDE } from '../../Types/Const';
import { ISlideData, ISlidePage, PageType } from '../../Types/Interfaces';
import { Tools } from '../../Shared';

export class SlideModel {
    private _snapshot: ISlideData;

    private _context: SlideContext;

    private _unitId: string;

    constructor(snapshot: Partial<ISlideData>, context: SlideContext) {
        this._context = context;
        this._snapshot = { ...DEFAULT_SLIDE, ...snapshot };
        this._unitId = this._snapshot.id ?? Tools.generateRandomId(6);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }

    getPages() {
        return this._snapshot.body?.pages;
    }

    getPageOrder() {
        return this._snapshot.body?.pageOrder;
    }

    getPage(pageId: string) {
        const pages = this.getPages();
        return pages?.[pageId];
    }

    getElementsByPage(pageId: string) {
        return this.getPage(pageId)?.pageElements;
    }

    getElement(pageId: string, elementId: string) {
        return this.getElementsByPage(pageId)?.[elementId];
    }

    getPageSize() {
        return this._snapshot.pageSize;
    }

    addPage(): ISlidePage {
        return {
            id: 'cover_1',
            pageType: PageType.SLIDE,
            zIndex: 1,
            title: 'cover',
            description: 'this is first page, cover',
            pageBackgroundFill: {
                rgb: 'rgb(255,255,255)',
            },
            pageElements: {},
        };
    }
}
