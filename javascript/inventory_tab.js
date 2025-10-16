function setupInventoryTabHandlers() {
    const inventoryList = document.getElementById('inventory-list');
    const addInventoryBtn = document.getElementById('add-inventory-item');
    if (inventoryList && addInventoryBtn) {
        addInventoryBtn.addEventListener('click', function() {
            const row = document.createElement('div');
            row.className = 'inventory-row';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '0.5em';
            row.style.marginBottom = '0.5em';
            row.innerHTML = `
                <input type="number" min="0" value="1" style="width: 2em;">
                <textarea placeholder="Item" style="width: 1em; min-width: 1em; max-width: 10em; height: 1.2em; min-height: 1.2em; font-size: 1.2em; resize: none; overflow:hidden;"></textarea>
                <textarea placeholder="Description" style="width: 18em; min-height: 2em; font-size: 1em; resize: none; overflow:hidden;"></textarea>
                <button class="delete-item" style="background: #c00; border: none; color: #000; font-size: 1.3em; cursor: pointer; padding: 0.2em 0.5em; border-radius: 4px;">
                    <span title="Delete" style="color: #000; font-weight: bold; pointer-events: none;">&#128465;</span>
                </button>
            `;
            row.querySelector('.delete-item').addEventListener('click', function() {
                row.remove();
            });
            // Auto-expand description textarea
            const descBox = row.querySelectorAll('textarea')[1];
            descBox.addEventListener('input', function() {
                this.style.height = '2em';
                this.style.height = (this.scrollHeight) + 'px';
            });
            // Auto-expand name textarea width and height only when overflowing
            const nameBox = row.querySelectorAll('textarea')[0];
            nameBox.addEventListener('input', function() {
                this.style.width = '5em';
                this.style.height = '2em';
                // Only expand width if overflowing
                if (this.scrollWidth > this.clientWidth && this.clientWidth < 160) {
                    this.style.width = Math.min(this.scrollWidth, 160) + 'px';
                }
                // If width is maxed, expand height for more lines
                if (this.clientWidth >= 160 && this.scrollHeight > this.clientHeight) {
                    this.style.height = (this.scrollHeight) + 'px';
                }
            });
            inventoryList.appendChild(row);
        });
    }
}

window.setupInventoryTabHandlers = setupInventoryTabHandlers;
