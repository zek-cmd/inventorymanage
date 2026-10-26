<?php
class Inventory extends Model {
    protected $table = 'inventory';

    public function create($item, $quantity, $date_added, $is_consumable, $category = '') {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (item, quantity, date_added, is_consumable, category) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$item, $quantity, $date_added, $is_consumable, $category]);
    }

    public function update($id, $item, $quantity, $date_added, $is_consumable, $category = '') {
        $existingItem = $this->find($id);
        if (!$existingItem) {
            throw new Exception('Inventory item not found.');
        }

        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET item = ?, quantity = ?, date_added = ?, is_consumable = ?, category = ? WHERE id = ?");
            $stmt->execute([$item, $quantity, $date_added, $is_consumable, $category, $id]);

            if ($existingItem['item'] !== $item) {
                $this->pdo->prepare("UPDATE requisition_items SET item = ? WHERE item = ?")
                    ->execute([$item, $existingItem['item']]);
                $this->pdo->prepare("UPDATE returns SET item = ? WHERE item = ?")
                    ->execute([$item, $existingItem['item']]);
            }

            $this->pdo->commit();
            return true;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
}
