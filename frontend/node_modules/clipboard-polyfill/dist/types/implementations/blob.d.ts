import { ClipboardItemInterface, ClipboardItems } from "../ClipboardItem/spec";
export declare function write(data: ClipboardItemInterface[]): Promise<void>;
export declare function read(): Promise<ClipboardItems>;
