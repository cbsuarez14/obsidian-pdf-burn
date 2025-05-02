import { App, Modal, Setting, Notice } from "obsidian";

export class PDFSelectorModal extends Modal {
    plugin: any;
    onFileSelect: (filePath: string) => void;

    constructor(app: App, plugin: any, onFileSelect: (filePath: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onFileSelect = onFileSelect;
    }

    onOpen() {
        
        const { contentEl } = this;

        contentEl.empty();
        contentEl.createEl("h2", { text: "Seleccione un archivo PDF de la Vault" });

        // Obtener todos los archivos de la Vault
        const files = this.app.vault.getFiles();

        // Filtrar solo los PDFs y mostrarlos en una lista
        files
            .filter((file) => file.extension === "pdf")
            .forEach((file) => {
                new Setting(contentEl)
                    .setName(file.name)
                    .setDesc(file.path)
                    .addButton((btn) =>
                        btn
                            .setButtonText("Seleccionar")
                            .setCta()
                            .onClick(async () => {
                                // Guardar el archivo seleccionado en la configuración
                                this.plugin.settings.pdfName = file.path;
                                this.onFileSelect(file.path);
                                await this.plugin.saveSettings();
                                //new Notice(`Archivo PDF seleccionado: ${file.name}`);
                                this.close();
                            })
                    );
            });

        // Mostrar un mensaje si no hay archivos PDF
        if (files.filter((file) => file.extension === "pdf").length === 0) {
            contentEl.createEl("p", { text: "No se encontraron archivos PDF en la Vault." });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
