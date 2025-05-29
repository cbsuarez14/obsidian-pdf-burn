import { App, Modal, Setting, Notice } from "obsidian";

export class MarkdownSelectorModal extends Modal {
    
    plugin: any;
    onFilesSelect: (filePath: string[]) => void;

    constructor(app: App, plugin: any, onFileSelect: (fileNames: string[]) => void) {
        super(app);
        this.plugin = plugin;
        this.onFilesSelect = onFileSelect;
    }

    onOpen(): void {
        const { contentEl } = this;

        contentEl.empty();
        contentEl.createEl("h2", { text: "Seleccione uno o varios archivos Markdown de la Vault" });

        const files = this.app.vault.getMarkdownFiles();

        const listContainer = contentEl.createDiv({ cls: "file-list-scrollable" });

        // Array de archivos seleccionados
        const selectedFileNames: Set<string> = new Set();

        // Línea que muestra los archivos seleccionados
        const selectedFileInfo = contentEl.createEl("p", {
            text: "Archivos Markdown seleccionados: ninguno",
            attr: { style: "margin-top: 1em;" }
        });

        // Función para actualizar el texto visible
        const updateSelectedText = () => {
            if (selectedFileNames.size === 0) {
                selectedFileInfo.setText("Archivos Markdown seleccionados: ninguno");
            } else {
                selectedFileInfo.setText(
                    "Archivos Markdown seleccionados:\n" + Array.from(selectedFileNames).join(", ")
                );
            }
        };

        // Mostrar la lista
        files.forEach((file) => {
            const setting = new Setting(listContainer).setName(file.basename).setDesc(file.path);

            setting.addButton((btn) => {
                // Función para actualizar el texto del botón
                const updateButton = () => {
                    const isSelected = selectedFileNames.has(file.basename);
                    btn.setButtonText(isSelected ? "Quitar" : "Añadir");
                    btn.setCta(); // Mantiene el estilo
                };

                btn.onClick(() => {
                    if (selectedFileNames.has(file.basename)) {
                        selectedFileNames.delete(file.basename);
                    } else {
                        selectedFileNames.add(file.basename);
                    }
                    updateButton();
                    updateSelectedText();
                });

                updateButton(); // Inicializa el botón correctamente
            });
        });


        // Botón Aceptar
        new Setting(contentEl)
            .setClass("markdown-accept-button-setting")
            .addButton((btn) =>
                btn.setButtonText("Aceptar").setCta().onClick(async () => {
                    if (selectedFileNames.size === 0) {
                        new Notice("Debe seleccionar al menos un archivo Markdown.");
                        return;
                    }

                    const fileList = Array.from(selectedFileNames);
                    // Guarda los archivos seleccionados en la configuración (como array o lo que uses)
                    this.plugin.settings.markdownName = fileList;
                    await this.plugin.saveSettings();

                    // Puedes llamar con el primero si solo usas uno, o adaptar tu lógica
                    this.onFilesSelect(fileList.map(f => f.replace(".md", "")));
                    this.close();
                })
            );
    }


}