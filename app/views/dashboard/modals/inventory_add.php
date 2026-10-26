<?php
// Variables available: $isAdmin
?>
<?php if ($isAdmin): ?>
<div id="addInventoryModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 hidden p-3 xs:p-4">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm xs:max-w-md border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        
        <div class="flex justify-between items-center px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-xl">
            <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Add Inventory Item</h5>
            <button class="modal-close p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        
        <div class="p-3 xs:p-4 sm:p-5">
            <form id="addInventoryForm">
                <div class="mb-3 xs:mb-4">
                    <label for="invItem" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Item Name *</label>
                    <input type="text" id="invItem" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="invCategory" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                    <input type="text" id="invCategory" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="invQuantity" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity *</label>
                    <input type="number" id="invQuantity" min="0" step="1" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    <p class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Set to 0 to add the item as Out of Stock.</p>
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="invDateAdded" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Added</label>
                    <input type="date" id="invDateAdded" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                
                <div class="mb-3 xs:mb-4 flex items-center gap-2">
                    <input type="checkbox" id="invIsConsumable" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 flex-shrink-0">
                    <label for="invIsConsumable" class="text-xs xs:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Consumable (no return needed)</label>
                </div>
                
                <button type="submit" class="w-full px-4 py-2 xs:py-2.5 text-xs xs:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all cursor-pointer shadow-sm">
                    Save Item
                </button>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>