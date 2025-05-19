export const filterCOLOR = [
    "", // No se aplica el filtro
    "yellow", 
    "red", 
    "note", 
    "important"
];

export const copyFORMATS = [
    "",
    "Quote",
    "Link",
    "Embed",
    "Callout",
    "Quote in callout"
];

export const displayFORMATS = [
    "",
    "Title & Page",
    "Page",
    "Text",
    "Emoji",
    "None"
];

export interface Settings {
    filterColor: string;
    copyFormat: string;
    displayFormat: string;
    exportToJSON: boolean;
    newPDFName: string;
    mapRectangles: boolean;
    writeToPDF: boolean;
    opacity: number;
    author: string;
}

export const DEFAULT_SETTINGS: Settings = {
    filterColor: "",
    copyFormat: "",
    displayFormat: "",
    exportToJSON: false,
    newPDFName: "testing",
    mapRectangles: false,
    writeToPDF: false,
    opacity: 1.0,
    author: ""
}

export interface Annotation {
    raw: string;
    context: string;
    link: string;
    pdfname: string;
    page: number;
    color: string;
    tags: string[];
    coordsSelection: number[] | number[][];
    coordsRectangles: number[];
    source: string;
    displayFormat: string;
    linkFormat: string;
    title: string;
}