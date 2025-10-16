# Draw Steel Character Sheet

A comprehensive character sheet symbiote for TaleSpire, specifically designed for the Draw Steel RPG system (formerly MCDM RPG). This character sheet provides a tabbed interface with all the essential tools for managing your Draw Steel character.

## Features

- **Tabbed Interface**: Organized into Main, Details, Inventory, Notes, and Rules tabs for easy navigation
- **Complete Character Tracking**: All Draw Steel stats, resources, skills, and character details
- **Interactive Dice Rolling**: Power rolls with stat selection, edge/bane modifiers, and automatic TaleSpire integration
- **Resource Management**: Stamina, recoveries, heroic resources, and surges with automatic calculations
- **Dynamic Inventory**: Add/remove items with auto-expanding text fields and intuitive controls
- **Skills System**: Organized skill categories matching Draw Steel's skill structure
- **Character Save/Load**: Save multiple characters by name and load them as needed
- **Persistent Storage**: Data persists even after closing TaleSpire
- **Rules Reference**: Built-in PDF viewer for quick rules lookup

### Power Roll System
- Select which stat to use for your power roll (Might, Agility, Reason, Intuition, Presence)
- Apply Edge or Bane modifiers
- Add custom numerical modifiers
- Automatic 2d10 + modifiers calculation and submission to TaleSpire dice tray

### Resource Tracking
- **Stamina**: Current/Max/Temp with automatic status tracking (Healthy/Winded/Dying/Dead)
- **Recoveries**: Track available recoveries with use button and stamina restoration
- **Heroic Resource**: Named resource tracking with random gain functionality
- **Surges**: Track surges with damage bonus calculations

All changes are automatically saved to both campaign storage and browser localStorage for maximum persistence.

## Installation

1. Download or clone this symbiote to your TaleSpire Symbiotes folder
2. Place your rules reference PDF in the symbiote folder and name it `rules_reference.pdf` (optional)
3. Load the symbiote in TaleSpire

## Usage

### Character Management
- Use the save/load bar at the top to manage multiple characters
- Enter a character name and click "Save" to store the current sheet
- Select a saved character from the dropdown and click "Load" to restore it

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

- Uses TaleSpire's Symbiote API for dice integration and storage
- Employs browser localStorage as backup storage for persistence
- Modular architecture for easy maintenance and customization
- Responsive design optimized for TaleSpire's embedded browser

## Credits

Designed for the Draw Steel RPG system by MCDM Productions.
