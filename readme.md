# Draw Steel Character Sheet

A comprehensive character sheet symbiote for TaleSpire, specifically designed for the Draw Steel RPG system (formerly MCDM RPG). This character sheet provides a tabbed interface with all the essential tools for managing your Draw Steel character.

## Features

- **Tabbed Interface**: Organized into Main, Details, Inventory, Notes, and Rules tabs for easy navigation
- **Complete Character Tracking**: All Draw Steel stats, resources, skills, and character details
- **Interactive Dice Rolling**: Power rolls with stat selection, edge/bane modifiers, and automatic TaleSpire integration
- **Resource Management**: Stamina, recoveries, heroic resources, and surges with automatic calculations
- **Enhanced Inventory System**: Add/remove items with quantities, descriptions, and stat bonuses
- **Item Bonus System**: Equipment can modify character stats, stamina, and recoveries
- **Visual Stat Indicators**: Green/red badges show active item bonuses on stat fields
- **Skills System**: Organized skill categories matching Draw Steel's skill structure
- **Smart Character Save/Load**: Save multiple characters by name with update-in-place functionality
- **Persistent Storage**: Uses TaleSpire's localStorage system for reliable data persistence
- **Auto-Save**: Automatic saving every 30 seconds with change detection
- **Rules Reference**: Built-in PDF viewer for quick rules lookup

### Power Roll System
- Select which stat to use for your power roll (Might, Agility, Reason, Intuition, Presence)
- Apply Edge or Bane modifiers
- Add custom numerical modifiers
- Automatic 2d10 + modifiers calculation and submission to TaleSpire dice tray

### Enhanced Inventory System
- **Item Management**: Add quantities, names, and descriptions for all items
- **Stat Bonuses**: Items can provide bonuses to any character stat
- **Resource Bonuses**: Items can increase max stamina, max recoveries, and recovery amounts
- **Collapsible Interface**: Clean bonus sections that expand when needed
- **Automatic Calculation**: Base stats + item bonuses = displayed totals
- **Visual Feedback**: Color-coded indicators show which stats have item bonuses

### Resource Tracking
- **Stamina**: Current/Max/Temp with automatic status tracking (Healthy/Winded/Dying/Dead)
- **Recoveries**: Track available recoveries with use button and stamina restoration
- **Heroic Resource**: Named resource tracking with random gain functionality
- **Surges**: Track surges with damage bonus calculations
- **Item Modifications**: Equipment bonuses automatically applied to max values

### Character Management
- **Smart Saving**: Updates existing characters instead of creating duplicates
- **Character Selection**: Visual dialog with character names, classes, levels, and save dates
- **Duplicate Cleanup**: Built-in tools to manage and clean existing character data
- **Legacy Support**: Can still import old character files when needed

## Installation

1. Download or clone this symbiote to your TaleSpire Symbiotes folder
2. Place your rules reference PDF in the symbiote folder and name it `rules_reference.pdf` (optional)
3. Load the symbiote in TaleSpire

## Usage

## Usage

### Character Management
- Enter a character name and click "Save Character" to store the current sheet
- Click "Load Character" to see a dialog of all saved characters with details
- Select any character to load it instantly - no file management required
- Characters automatically update when saved again (no duplicates created)

### Inventory & Equipment
- Click "Add Item" to create new inventory entries
- Set quantities, names, and descriptions for each item
- Click "Bonuses ▼" to expand stat bonus options for magical/enhanced items
- Set bonuses for stats (Might, Agility, etc.) or resources (Max Stamina, Recoveries)
- Bonuses automatically apply to your character stats with visual indicators
- Green/red badges on stat fields show active item bonuses

### Power Rolls
1. Select the stat you want to use for the roll
2. Choose Edge or Bane if applicable
3. Add any other numerical modifiers
4. Click the Power Roll button to send the roll to TaleSpire's dice tray

### Resource Management
- **Take Damage**: Enter damage amount and click "Take" to reduce stamina
- **Heal**: Enter healing amount and click "Heal" to restore stamina
- **Use Recovery**: Click to spend a recovery and restore stamina
- **Reset Resources**: Resets surges and sets heroic resource based on victories
- **Add Heroic**: Randomly adds 1-3 to your heroic resource

### Maintenance (Advanced)
- Open browser console and run `cleanupDuplicateCharacters()` to remove any duplicate entries
- Run `window.recalculateItemBonuses()` to refresh item bonus calculations

## File Structure

The symbiote is organized into modular files for easy maintenance:

- `sheet_core.html` - Main HTML file
- `tabs/` - Individual tab HTML files
- `css/` - Stylesheets for each tab
- `javascript/` - Modular JavaScript files
  - `sheet_core.js` - Core functionality and tab management
  - `main_tab.js` - Power rolls and main tab logic
  - `stamina.js` - Stamina and health management
  - `resources.js` - Resource tracking and management
  - `inventory_tab.js` - Dynamic inventory system
  - `details_tab.js` - Character details and skills
  - `notes_tab.js` - Notes functionality
  - `rules_tab.js` - Rules reference integration

## Customization

This character sheet is specifically designed for Draw Steel but can be adapted for other systems. The modular file structure makes customization straightforward:

### Adding Fields
Copy existing input fields and rename their IDs. All input fields with unique IDs are automatically saved and restored.

### Custom Dice Rolls
Add `data-dice-type` attribute to labels to make them clickable for rolling. The accompanying input field's value will be added as a modifier. Use `data-modifier="no-mod"` to disable modifiers, or `data-modifier="field-id"` to use a different field's value.

### Styling
Each tab has its own CSS file in the `css/` folder for easy styling modifications.

### Adding Tabs
1. Create a new HTML file in `tabs/`
2. Add a corresponding CSS file in `css/`
3. Create a JavaScript file in `javascript/`
4. Update `sheet_core.html` and `sheet_core.js` to include the new tab

## Technical Details

- Uses TaleSpire's Symbiote API for dice integration and primary data storage
- TaleSpire global localStorage provides reliable character persistence
- Smart save system prevents character duplicates and manages updates efficiently
- Item bonus system with real-time stat calculation and visual feedback
- Modular architecture for easy maintenance and customization
- Auto-save functionality with change detection and 30-second intervals
- Responsive design optimized for TaleSpire's embedded browser

## Credits

Designed for the Draw Steel RPG system by MCDM Productions.
