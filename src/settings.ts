import { App, PluginSettingTab, Setting } from "obsidian";
import AutoPinPlugin from "./main";

export interface AutoPinSettings {
	enabled: boolean;
	pinExistingOnLoad: boolean;
	pinMarkdown: boolean;
	pinCanvas: boolean;
	pinBases: boolean;
	pinOther: boolean;
	excludedFolders: string[];
	bypassOnMiddleClick: boolean;
	bypassOnModifierClick: boolean;
}

export const DEFAULT_SETTINGS: AutoPinSettings = {
	enabled: true,
	pinExistingOnLoad: false,
	pinMarkdown: true,
	pinCanvas: true,
	pinBases: true,
	pinOther: false,
	excludedFolders: [],
	bypassOnMiddleClick: false,
	bypassOnModifierClick: false,
};

export class AutoPinSettingTab extends PluginSettingTab {
	plugin: AutoPinPlugin;

	constructor(app: App, plugin: AutoPinPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Enable auto-pin")
			.setDesc("Automatically pin tabs when they are opened")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Pin existing tabs on load")
			.setDesc("Pin all currently open tabs when the plugin loads")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.pinExistingOnLoad)
					.onChange(async (value) => {
						this.plugin.settings.pinExistingOnLoad = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName("File types").setHeading();

		new Setting(containerEl)
			.setName("Pin Markdown notes")
			.setDesc("Automatically pin Markdown (.md) files")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.pinMarkdown)
					.onChange(async (value) => {
						this.plugin.settings.pinMarkdown = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Pin canvas files")
			.setDesc("Automatically pin canvas (.canvas) files")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.pinCanvas)
					.onChange(async (value) => {
						this.plugin.settings.pinCanvas = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Pin bases")
			.setDesc("Automatically pin bases (database views)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.pinBases)
					.onChange(async (value) => {
						this.plugin.settings.pinBases = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Pin other file types")
			.setDesc("Automatically pin other file types (PDF, images, etc.)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.pinOther)
					.onChange(async (value) => {
						this.plugin.settings.pinOther = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName("Exclusions").setHeading();

		new Setting(containerEl)
			.setName("Excluded folders")
			.setDesc(
				"Comma-separated list of folder paths to exclude from auto-pinning",
			)
			.addText((text) =>
				text
					.setPlaceholder("Folder1, folder2/subfolder")
					.setValue(this.plugin.settings.excludedFolders.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.excludedFolders = value
							.split(",")
							.map((s) => s.trim())
							.filter((s) => s.length > 0);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName("Bypass").setHeading();

		new Setting(containerEl)
			.setName("Bypass on middle-click")
			.setDesc("Don't auto-pin tabs opened via middle mouse button")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.bypassOnMiddleClick)
					.onChange(async (value) => {
						this.plugin.settings.bypassOnMiddleClick = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Bypass on modifier-click")
			.setDesc("Don't auto-pin tabs opened via Ctrl+click (or Cmd+click on Mac)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.bypassOnModifierClick)
					.onChange(async (value) => {
						this.plugin.settings.bypassOnModifierClick = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
