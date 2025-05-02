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
    mapRectangles: boolean;
    writeToPDF: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    filterColor: "",
    copyFormat: "",
    displayFormat: "",
    exportToJSON: false,
    mapRectangles: false,
    writeToPDF: false
}