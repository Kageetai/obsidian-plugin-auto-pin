# Auto Pin for Obsidian

Automatically pin tabs when they are opened in Obsidian.

## Features

- **Automatic pinning** - Tabs are pinned automatically when opened
- **File type control** - Choose which file types to auto-pin:
    - Markdown notes (.md)
    - Canvas files (.canvas)
    - Bases (database views)
    - Other file types (PDF, images, etc.)
- **Folder exclusions** - Exclude specific folders from auto-pinning
- **Manual commands** - Pin or unpin all tabs at once

## Installation

### From Obsidian Community Plugins

> [!IMPORTANT]
> Not yet available on the Community Plugins page ([PR pending](https://github.com/obsidianmd/obsidian-releases/pull/9887))

[//]: # "1. Open Obsidian Settings"
[//]: # "2. Go to Community Plugins and disable Safe Mode"
[//]: # '3. Click Browse and search for "Auto Pin"'
[//]: # "4. Install the plugin and enable it"

### Using BRAT

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins
2. Open BRAT settings and click "Add Beta plugin"
3. Enter the repository URL: `Kageetai/obsidian-plugin-auto-pin`
4. Click "Add Plugin" and enable it in Settings → Community Plugins

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder named `auto-pin` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the folder
4. Reload Obsidian and enable the plugin in Settings → Community Plugins

## Settings

| Setting                   | Default | Description                             |
| ------------------------- | ------- | --------------------------------------- |
| Enable auto-pin           | On      | Master toggle for automatic pinning     |
| Pin existing tabs on load | Off     | Pin all open tabs when the plugin loads |
| Pin Markdown notes        | On      | Auto-pin .md files                      |
| Pin canvas files          | On      | Auto-pin .canvas files                  |
| Pin bases                 | On      | Auto-pin database views                 |
| Pin other file types      | Off     | Auto-pin PDFs, images, etc.             |
| Excluded folders          | Empty   | Comma-separated folder paths to exclude |

## Commands

- **Pin all open tabs** - Manually pin all currently open tabs
- **Unpin all tabs** - Remove pins from all tabs

## Development

```bash
# Install dependencies
npm install

# Build for development (watch mode)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## License

[BSD Zero Clause License](LICENSE)
