import { ClipboardItemInterface } from "./spec";
export declare function stringToBlob(type: string, str: string): Blob;
export declare function blobToString(blob: Blob): Promise<string>;
export declare function clipboardItemToGlobalClipboardItem(clipboardItem: ClipboardItemInterface): Promise<ClipboardItemInterface>;
export declare function textToClipboardItem(text: string): ClipboardItemInterface;
export declare function getTypeAsString(clipboardItem: ClipboardItemInterface, type: string): Promise<string>;
export interface StringItem {
    [type: string]: string;
}
export declare function toStringItem(data: ClipboardItemInterface): Promise<StringItem>;
