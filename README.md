# Component Horde: Guitar Pedal Parts Inventory
A modern, offline-friendly, mobile-first inventory and project management app for guitar pedal builders.
Easily track your parts, manage projects, compare BOMs, and sync data across devices.

# Features
## Inventory Management:
- Add, edit, delete, and reorder parts with quantities, purchase links, and optional NFC Tag IDs.
## Project Management:
- Create projects, assign parts/BOMs, and track which parts are needed for each build.
## BOM Comparison:
- Import a BOM (CSV/JSON), compare it to your inventory, and see what’s missing or low.
## Export/Import:
- Export your full inventory and projects as a JSON file for backup or transfer. Import on any device.
## PWA (Progressive Web App):
- Install on your phone or desktop for offline use and a native app feel.
## Search & Sort:
- Instantly search and sort your parts by name, quantity, or stock status.
## Responsive Design:
- Works beautifully on mobile, tablet, and desktop.
## Customizable:
- Add purchase URLs, NFC tag IDs, and more.
## Dark Nord Theme:
- Clean, modern, and easy on the eyes.
## NFC Tag Integration:
- Store an NFC Tag ID with any part for reference and searching.
- Quick inventory adjustment: Program an NFC tag (using an app like NFC Tools) to open a URL like
```
https://your-app-url/?part=part_id&remove=1
```
(replace part_id with your actual part’s ID, e.g., resistor_10k).

Scanning the tag with your phone will automatically subtract 1 from that part’s inventory—perfect for quick bin or bag management.

Works on both iPhone and Android using the phone’s built-in NFC scanning and browser.
## How to Use
### 3.Add Parts
- Click Add New Part.
- Enter the part name, quantity, and (optionally) a purchase URL or NFC tag ID.
### 2. Manage Inventory
- Use the + and – buttons to adjust stock.
- Click the pencil icon to edit, or the trash icon to delete a part.
### 3. Projects & BOMs
- Click Manage Projects to create or delete projects.
- Import a BOM (CSV/JSON) to create a new project and compare it to your inventory.
- View project details to see which parts are missing or low.

### 4. Export/Import Data
- Use the Export Data button to save your inventory and projects as a JSON file.
- Use Import Data to restore or transfer your data to another device.

### 5. Search & Sort
- Use the search bar to filter parts by name.
- Sort by name, quantity, or stock status using the dropdowns.

### 6. Offline & PWA
- Install the app to your home screen for offline use.
- All data is stored locally in your browser—no cloud required.

## Technical Details
- Frontend: HTML, CSS (Nord theme), JavaScript
- PWA: Manifest, service worker, offline support
- Data Storage: localStorage (all data stays on your device)
- Font: JetBrains Mono (self-hosted for offline/PWA support), Goldman for header
- Icons: SVG and favicon included
## Data Safety
- Backup: Regularly export your data for backup.
- Privacy: All data is stored locally and never sent to a server.
## Import/Export Format
- Exported JSON includes both inventory and projects:
```
{
    "inventory": { ... },
    "projects": { ... }
  }
```
## Contributing
Pull requests and suggestions are welcome.

If you find a bug or have a feature request, please open an issue or contact the maintainer.
## Feedback
Questions, feedback, or want to say thanks?

Open an issue or reach out via Buy Me a Coffee.
## License
MIT License (or your preferred license)
### Enjoy building pedals and keeping your parts organized!
