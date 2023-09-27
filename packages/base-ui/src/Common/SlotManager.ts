import { Nullable } from '@univerjs/core';

import { Slot } from '../Components/Slot/Slot';
import { ICustomComponent } from './ComponentManager';

export type SlotComponent = {
    name: string;
    component: ICustomComponent;
};

export type SlotGroupProps = Map<string, Map<string, SlotComponent>>;
export type SlotList = Map<string, typeof Slot>;

export class SlotManager {
    // slot配置
    private _slotGroup: SlotGroupProps = new Map();

    // slot实例
    private _slotList: SlotList = new Map();

    getComponent = (ref: any) => {
        this._slotList.set(ref.props.name, ref);
        const slot = this._slotGroup.get(ref.props.name);
        if (!slot) return;
        ref.setSlotAll(slot);
    };

    setSlotComponent(slotName: string, component: SlotComponent, cb?: () => {}) {
        const slot = this._slotGroup.get(slotName);
        if (!slot) {
            const map = new Map([[component.name, component]]);
            this._slotGroup.set(slotName, map);
        } else {
            slot.set(component.name, component);
        }

        const item = this._slotList.get(slotName) as any;
        item?.setSlot(component, cb);
    }

    removeSlotComponent(slotName: string, name: string) {
        const slot = this._slotList.get(slotName);
        if (!slot) return;
        const SlotComponent = this._slotGroup.get(slotName);
        if (!SlotComponent) return;
        const component = SlotComponent.get(name);
        if (!component) return;
        (slot as any).removeSlot(component);
    }

    getSlot(slotName: string): Nullable<typeof Slot> {
        const slot = this._slotList.get(slotName);
        if (slot) return slot;
    }

    removeSlot(name: string) {
        this._slotGroup.delete(name);
        const slot = this._slotList.get(name) as any;
        if (slot) {
            slot.setSlotAll(new Map());
            this._slotList.delete(name);
        }
    }
}
