import { Plugin } from 'vite';

var version = "0.5.1";

interface RelatedElements {
    children: Array<BaseElement>;
    parent: BaseElement | null;
}
interface ElementMetadata extends BaseElement {
    elementPath: string;
    elementName: string;
    originalTextContent?: string;
    screenshotBlob?: Blob;
    srcAttribute?: string;
    siblingCount?: number;
    hasChildElements?: boolean;
    computedStyles: {
        backgroundColor: string;
        borderTopColor: string;
        borderRightColor: string;
        borderBottomColor: string;
        borderLeftColor: string;
        borderTopLeftRadius: string;
        borderTopRightRadius: string;
        borderBottomRightRadius: string;
        borderBottomLeftRadius: string;
        borderTopWidth: string;
        borderRightWidth: string;
        borderBottomWidth: string;
        borderLeftWidth: string;
        color: string;
        display: string;
        position: string;
        width: string;
        height: string;
        fontSize: string;
        fontFamily: string;
        fontWeight: string;
        margin: string;
        padding: string;
        opacity: string;
        textAlign: string;
    };
    relatedElements: RelatedElements & {
        /** @deprecated */
        nextSibling?: BaseElement;
        /** @deprecated */
        grandParent?: BaseElement;
    };
}
interface BaseElement {
    tagName: string;
    className?: string;
    textContent: string;
    id?: string;
    nodeId?: number;
    relatedElements: RelatedElements;
}
type Message = {
    type: 'TOGGLE_REPLIT_VISUAL_EDITOR';
    timestamp: number;
    enabled: boolean;
    enableEditing?: boolean;
} | {
    type: 'REPLIT_VISUAL_EDITOR_ENABLED';
    timestamp: number;
} | {
    type: 'REPLIT_VISUAL_EDITOR_DISABLED';
    timestamp: number;
} | {
    type: 'ELEMENT_SELECTED';
    payload: ElementMetadata;
    timestamp: number;
} | {
    type: 'ELEMENT_UNSELECTED';
    timestamp: number;
} | {
    type: 'ELEMENT_TEXT_CHANGED';
    payload: ElementMetadata;
    timestamp: number;
} | {
    type: 'SELECTOR_SCRIPT_LOADED';
    timestamp: number;
    version: string;
} | {
    type: 'CLEAR_SELECTION';
    timestamp: number;
} | {
    type: 'UPDATE_SELECTED_ELEMENT';
    timestamp: number;
    attributes: {
        style?: string;
        textContent?: string;
        className?: string;
        src?: string;
    };
} | {
    type: 'CLEAR_ELEMENT_DIRTY';
    timestamp: number;
} | {
    type: 'APPLY_THEME_PREVIEW';
    timestamp: number;
    themeContent: string;
} | {
    type: 'CLEAR_THEME_PREVIEW';
    timestamp: number;
} | {
    type: 'LIGHT_MODE_USED';
    timestamp: number;
} | {
    type: 'DARK_MODE_USED';
    timestamp: number;
} | {
    type: 'SCREENSHOT_PAGE';
    timestamp: number;
    /** Opaque caller-provided ID echoed back in the result so the requester
     *  can correlate the response when multiple screenshots are in-flight. */
    requestId: string;
} | {
    type: 'SCREENSHOT_PAGE_RESULT';
    timestamp: number;
    requestId: string;
    screenshotBlob?: Blob;
    error?: string;
};

interface CartographerOptions {
    /** Override the root directory for metadata path resolution (absolute or relative to Vite root) */
    root?: string;
}
declare function cartographer(options?: CartographerOptions): Plugin;

export { type BaseElement, type CartographerOptions, type ElementMetadata, type Message, cartographer, version };
