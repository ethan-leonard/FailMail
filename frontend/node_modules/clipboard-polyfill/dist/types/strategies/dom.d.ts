import { StringItem } from "../ClipboardItem/convert";
export declare function execCopy(data: StringItem): boolean;
export declare function copyUsingTempSelection(e: HTMLElement, data: StringItem): boolean;
export declare function copyUsingTempElem(data: StringItem): boolean;
export declare function copyTextUsingDOM(str: string): boolean;
