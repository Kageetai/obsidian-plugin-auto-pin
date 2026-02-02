import { Plugin, TFile, WorkspaceLeaf } from "obsidian";
import {
	AutoPinSettings,
	AutoPinSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";

export default class AutoPinPlugin extends Plugin {
	settings: AutoPinSettings;
	private processedLeafIds: Set<string> = new Set();
	private lastClickInfo: {
		button: number;
		ctrlKey: boolean;
		metaKey: boolean;
		timestamp: number;
	} | null = null;
	private mousedownHandler: ((evt: MouseEvent) => void) | null = null;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AutoPinSettingTab(this.app, this));

		// Pin existing tabs on load if setting is enabled
		if (this.settings.pinExistingOnLoad && this.settings.enabled) {
			this.app.workspace.onLayoutReady(() => {
				this.pinAllExistingLeaves();
			});
		}

		// Set up bypass event listener based on current settings
		this.updateBypassEventListener();

		// Listen for active leaf changes - catches new tabs being opened
		this.registerEvent(
			this.app.workspace.on(
				"active-leaf-change",
				(leaf: WorkspaceLeaf | null) => {
					if (leaf && this.settings.enabled) {
						this.pinLeafIfEligible(leaf);
					}
				},
			),
		);

		// Listen to layout-change to catch tabs opened via splits/duplicates
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				if (this.settings.enabled) {
					this.pinNewlyCreatedLeaves();
				}
			}),
		);

		// Command to manually pin all tabs
		this.addCommand({
			id: "pin-all-tabs",
			name: "Pin all open tabs",
			callback: () => {
				this.pinAllExistingLeaves();
			},
		});

		// Command to unpin all tabs
		this.addCommand({
			id: "unpin-all-tabs",
			name: "Unpin all tabs",
			callback: () => {
				this.unpinAllLeaves();
			},
		});
	}

	onunload() {
		this.processedLeafIds.clear();
		this.lastClickInfo = null;
		this.removeBypassEventListener();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<AutoPinSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateBypassEventListener();
	}

	/**
	 * Update the bypass event listener based on current settings
	 */
	private updateBypassEventListener(): void {
		const shouldListen =
			this.settings.bypassOnMiddleClick ||
			this.settings.bypassOnModifierClick;

		if (shouldListen && !this.mousedownHandler) {
			// Register the listener
			this.mousedownHandler = (evt: MouseEvent) => {
				this.lastClickInfo = {
					button: evt.button,
					ctrlKey: evt.ctrlKey,
					metaKey: evt.metaKey,
					timestamp: Date.now(),
				};
			};
			document.addEventListener("mousedown", this.mousedownHandler);
		} else if (!shouldListen && this.mousedownHandler) {
			// Remove the listener
			this.removeBypassEventListener();
		}
	}

	/**
	 * Remove the bypass event listener
	 */
	private removeBypassEventListener(): void {
		if (this.mousedownHandler) {
			document.removeEventListener("mousedown", this.mousedownHandler);
			this.mousedownHandler = null;
		}
	}

	/**
	 * Get the file associated with a leaf, if any
	 */
	private getFileFromLeaf(leaf: WorkspaceLeaf): TFile | null {
		const view = leaf.view;
		// Check if the view has a file property (FileView interface)
		if ("file" in view && view.file instanceof TFile) {
			return view.file;
		}
		return null;
	}

	/**
	 * Check if a leaf's view type should be pinned based on settings
	 */
	private isViewTypeEligible(viewType: string): boolean {
		switch (viewType) {
			case "markdown":
				return this.settings.pinMarkdown;
			case "canvas":
				return this.settings.pinCanvas;
			case "bases":
				return this.settings.pinBases;
			default:
				// For other file-based views (pdf, image, etc.)
				return this.settings.pinOther;
		}
	}

	/**
	 * Check if a file should be excluded based on folder settings
	 */
	private isFileExcluded(file: TFile): boolean {
		for (const folder of this.settings.excludedFolders) {
			if (file.path.startsWith(folder)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check if auto-pin should be bypassed based on how the tab was opened
	 */
	private shouldBypassAutoPinBasedOnEvent(): boolean {
		// Use captured click info (valid for 500ms to account for event processing delay)
		if (
			!this.lastClickInfo ||
			Date.now() - this.lastClickInfo.timestamp > 500
		) {
			return false;
		}

		// Middle-click (button === 1)
		if (this.settings.bypassOnMiddleClick && this.lastClickInfo.button === 1) {
			return true;
		}

		// Ctrl+click (Windows/Linux) or Cmd+click (Mac)
		if (
			this.settings.bypassOnModifierClick &&
			(this.lastClickInfo.ctrlKey || this.lastClickInfo.metaKey)
		) {
			return true;
		}

		return false;
	}

	/**
	 * Pin a leaf if it meets all eligibility criteria
	 */
	private pinLeafIfEligible(leaf: WorkspaceLeaf): void {
		// Using an undocumented property 'id' for unique leaf identification.
		// This may break in future Obsidian updates.
		const leafId = (leaf as unknown as { id: string }).id;

		// Skip if we've already processed this leaf to avoid re-evaluation
		if (!leafId || this.processedLeafIds.has(leafId)) {
			return;
		}

		// Mark as processed early to prevent re-evaluation on subsequent layout changes
		this.processedLeafIds.add(leafId);

		// Check if auto-pin should be bypassed based on how the tab was opened
		if (this.shouldBypassAutoPinBasedOnEvent()) {
			return;
		}

		// Check if the leaf has an associated file (primary filter)
		const file = this.getFileFromLeaf(leaf);
		if (!file) {
			// No file associated - skip (this excludes graph, settings, search, etc.)
			return;
		}

		// Check if view type is eligible based on settings
		const viewType = leaf.getViewState().type;
		if (!this.isViewTypeEligible(viewType)) {
			return;
		}

		// Check if file is in an excluded folder
		if (this.isFileExcluded(file)) {
			return;
		}

		// All checks passed - pin the leaf
		leaf.setPinned(true);
	}

	/**
	 * Pin all existing leaves in the workspace
	 */
	private pinAllExistingLeaves(): void {
		this.app.workspace.iterateAllLeaves((leaf) => {
			this.pinLeafIfEligible(leaf);
		});
	}

	/**
	 * Scan for and pin any newly created leaves
	 */
	private pinNewlyCreatedLeaves(): void {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const leafId = (leaf as unknown as { id: string }).id;
			if (leafId && !this.processedLeafIds.has(leafId)) {
				this.pinLeafIfEligible(leaf);
			}
		});
	}

	/**
	 * Unpin all leaves in the workspace
	 */
	private unpinAllLeaves(): void {
		this.app.workspace.iterateAllLeaves((leaf) => {
			leaf.setPinned(false);
		});
		this.processedLeafIds.clear();
	}
}
