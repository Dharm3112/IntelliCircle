"use strict";
// Type definitions copied from the in-repo @posthog/rrweb-types and @posthog/rrweb-snapshot packages
// (a fork of upstream @rrweb/types and rrweb-snapshot, both MIT licensed: https://github.com/rrweb-io/rrweb)
//
// These types are inlined here to avoid requiring users to install peer dependencies
// solely for TypeScript type information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasContext = exports.MediaInteractions = exports.PointerTypes = exports.MouseInteractions = exports.IncrementalSource = exports.EventType = exports.NodeType = void 0;
exports.NodeType = {
    Document: 0,
    DocumentType: 1,
    Element: 2,
    Text: 3,
    CDATA: 4,
    Comment: 5,
};
exports.EventType = {
    DomContentLoaded: 0,
    Load: 1,
    FullSnapshot: 2,
    IncrementalSnapshot: 3,
    Meta: 4,
    Custom: 5,
    Plugin: 6,
};
exports.IncrementalSource = {
    Mutation: 0,
    MouseMove: 1,
    MouseInteraction: 2,
    Scroll: 3,
    ViewportResize: 4,
    Input: 5,
    TouchMove: 6,
    MediaInteraction: 7,
    StyleSheetRule: 8,
    CanvasMutation: 9,
    Font: 10,
    Log: 11,
    Drag: 12,
    StyleDeclaration: 13,
    Selection: 14,
    AdoptedStyleSheet: 15,
    CustomElement: 16,
};
exports.MouseInteractions = {
    MouseUp: 0,
    MouseDown: 1,
    Click: 2,
    ContextMenu: 3,
    DblClick: 4,
    Focus: 5,
    Blur: 6,
    TouchStart: 7,
    TouchMove_Departed: 8,
    TouchEnd: 9,
    TouchCancel: 10,
};
exports.PointerTypes = {
    Mouse: 0,
    Pen: 1,
    Touch: 2,
};
exports.MediaInteractions = {
    Play: 0,
    Pause: 1,
    Seeked: 2,
    VolumeChange: 3,
    RateChange: 4,
};
exports.CanvasContext = {
    '2D': 0,
    WebGL: 1,
    WebGL2: 2,
};
//# sourceMappingURL=rrweb-types.js.map