import { ISheetActionData } from '../Command';
import { Tools } from '../Shared';

/**
 * Properties of server message
 */
export interface IOServerMessage {
    version: string;
    changed: ISheetActionData[];
}

/**
 *  Properties of server receive
 */
export interface IOServerReceive<T> {
    type: ServerReceiveType;
    message: T;
}

/**
 * Type of server receive
 */
export enum ServerReceiveType {
    MESSAGE_RESPONSE = 'message_response',
}

/**
 * Basics class for Server
 */
export abstract class ServerBase {
    static isMessageResponseReceive(receive: IOServerReceive<unknown>): receive is IOServerReceive<IOServerMessage> {
        return receive.type === ServerReceiveType.MESSAGE_RESPONSE;
    }

    /**
     * Pack the action data
     *
     * @privateRemarks
     * zh: 将action数据打包
     *
     * @param changed
     * @returns
     */
    packMessage(changed: ISheetActionData[]): IOServerMessage {
        return {
            changed,
            version: Tools.generateRandomId(6),
        };
    }

    abstract pushMessageQueue(data: ISheetActionData[]): void;
}
