import { App, Modal, Setting, Notice } from "obsidian";

export class MarkdownSelectorModal extends Modal {
    
    plugin: any;
    onFileSelect: (filePath: string) => void;

    constructor(app: App, plugin: any, onFileSelect: (fileName: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onFileSelect = onFileSelect;
    }

    onOpen(): void {
        const {contentEl} = this;

        contentEl.empty();
        contentEl.createEl("h2", {text: "Seleccione un archivo Markdown de la Vault"});


        // Obtenemos todos los archivos de la Vault
        const files = this.app.vault.getFiles();

        // Filtramos solo los archivos Markdown y los mostramos en una lista
        files
            .filter((file) => file.extension === "md")
            .forEach((file) => {
                new Setting(contentEl)
                    .setName(file.basename)
                    .setDesc(file.path)
                    .addButton((btn) =>
                        btn
                            .setButtonText("Seleccionar")
                            .setCta()
                            .onClick(async () => {

                                // Guardamos el archivo seleccionado en la configuración
                                this.plugin.settings.markdownName = file.basename;
                                this.onFileSelect(file.basename.replace(".md", ""));
                                await this.plugin.saveSettings();
                                new Notice(`Archivo Markdown seleccionado: ${file.basename}`);
                                this.close();
                            })
                    );
            });


        // Mostramos un mensaje si no hay archivos Markdown
        if (files.filter((file) => file.extension === "md").length === 0) {
            contentEl.createEl("p", {text: "No se encontraron archivos Markdown en la Vault."});
        };   
                
    }

}