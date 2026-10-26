<?php
class Requisition extends Model {
    protected $table = 'requisitions';

    public function create($name, $date, $department, $position, $note) {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (name, date, department, position, note) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $date, $department, $position, $note]);
        return $this->pdo->lastInsertId();
    }

    public function addItem($requisitionId, $item, $quantity, $isConsumable) {
    $stmt = $this->pdo->prepare("INSERT INTO requisition_items (requisition_id, item, quantity, is_consumable) VALUES (?, ?, ?, ?)");
    return $stmt->execute([$requisitionId, $item, $quantity, $isConsumable]);
}

    public function getItems($requisitionId) {
        $stmt = $this->pdo->prepare("SELECT * FROM requisition_items WHERE requisition_id = ?");
        $stmt->execute([$requisitionId]);
        return $stmt->fetchAll();
    }

    public function allWithItems() {
    $requisitions = $this->all();
    foreach ($requisitions as &$req) {
        $req['items'] = $this->getItems($req['id']);
        $req['item_summary'] = $this->getItemSummary($req['id']);
        $req['is_consumed'] = $this->isConsumed($req['id']);
    }
    return $requisitions;
}

    public function getByDateRange($fromDate, $toDate) {
        $stmt = $this->pdo->prepare("
            SELECT r.*, GROUP_CONCAT(
                CONCAT(ri.item, ' (', ri.quantity, ')')
                ORDER BY ri.id SEPARATOR '; '
            ) AS item_summary
            FROM {$this->table} r
            INNER JOIN requisition_items ri ON ri.requisition_id = r.id
            WHERE r.date BETWEEN ? AND ?
            GROUP BY r.id
            ORDER BY r.date ASC, r.id ASC
        ");
        $stmt->execute([$fromDate, $toDate]);
        return $stmt->fetchAll();
    }

    public function getByIds($ids) {
        if (empty($ids)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->pdo->prepare("
            SELECT r.*, GROUP_CONCAT(
                CONCAT(ri.item, ' (', ri.quantity, ')')
                ORDER BY ri.id SEPARATOR '; '
            ) AS item_summary
            FROM {$this->table} r
            INNER JOIN requisition_items ri ON ri.requisition_id = r.id
            WHERE r.id IN ($placeholders)
            GROUP BY r.id
            ORDER BY r.date ASC, r.id ASC
        ");
        $stmt->execute($ids);
        return $stmt->fetchAll();
    }

   public function getItemSummary($requisitionId) {
    $items = $this->getItems($requisitionId);
    $names = array_map(function($item) {
        $type = $item['is_consumable'] == 1 ? 'C' : 'R';
        return $item['item'] . ' (' . $item['quantity'] . ') [' . $type . ']';
    }, $items);
    return implode(', ', $names);
}

    public function updateStatus($id, $status, $approvedBy) {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = ?, approved_by = ? WHERE id = ?");
        return $stmt->execute([$status, $approvedBy, $id]);
    }

    public function deductInventory($id) {
        $items = $this->getItems($id);
        
        foreach ($items as $item) {
            $stmt = $this->pdo->prepare("SELECT * FROM inventory WHERE item = ?");
            $stmt->execute([$item['item']]);
            $invItem = $stmt->fetch();
            
            if ($invItem) {
                $newQuantity = $invItem['quantity'] - $item['quantity'];
                $updateStmt = $this->pdo->prepare("UPDATE inventory SET quantity = ? WHERE id = ?");
                $updateStmt->execute([$newQuantity, $invItem['id']]);
            }
        }
    }

public function toggleItemConsumable($itemId, $isConsumable) {
    $stmt = $this->pdo->prepare("SELECT * FROM requisition_items WHERE id = ?");
    $stmt->execute([$itemId]);
    $item = $stmt->fetch();
    
    if (!$item) {
        return false;
    }
    
    $oldValue = (int)$item['is_consumable'];
    $newValue = (int)$isConsumable;
    
    if ($oldValue === $newValue) {
        return true;
    }
    
    $updateStmt = $this->pdo->prepare("UPDATE requisition_items SET is_consumable = ? WHERE id = ?");
    $updateStmt->execute([$newValue, $itemId]);
    
    // Update requisition status based on current item states
    $this->updateStatusBasedOnItems($item['requisition_id']);
    
    return true;
}

public function updateNote($requisitionId, $note) {
    $stmt = $this->pdo->prepare("UPDATE {$this->table} SET note = ? WHERE id = ?");
    $stmt->execute([$note === '' ? null : $note, $requisitionId]);
    return $stmt->rowCount() > 0 || (bool)$this->find($requisitionId);
}

public function updateStatusBasedOnItems($requisitionId) {
    // Count outstanding returnable items
    $stmt = $this->pdo->prepare("
        SELECT COUNT(*) as count 
        FROM requisition_items 
        WHERE requisition_id = ? 
        AND is_consumable = 0 
        AND (returned_quantity + quantity_lost) < quantity
    ");
    $stmt->execute([$requisitionId]);
    $outstanding = (int)$stmt->fetch()['count'];
    
    if ($outstanding > 0) {
        // Still items to return → approved
        $this->pdo->prepare("UPDATE requisitions SET status = 'approved', date_returned = NULL WHERE id = ?")
            ->execute([$requisitionId]);
        return;
    }
    
    // No outstanding returnables — check totals
    $totalsStmt = $this->pdo->prepare("
        SELECT 
            SUM(returned_quantity) as total_returned,
            SUM(quantity_lost) as total_lost,
            SUM(quantity) as total_quantity
        FROM requisition_items 
        WHERE requisition_id = ?
    ");
    $totalsStmt->execute([$requisitionId]);
    $totals = $totalsStmt->fetch();
    
    $totalReturned = (int)$totals['total_returned'];
    $totalLost = (int)$totals['total_lost'];
    $totalQuantity = (int)$totals['total_quantity'];
    
    if ($totalLost > 0) {
        $this->pdo->prepare("UPDATE requisitions SET status = 'lost', date_returned = NOW() WHERE id = ?")
            ->execute([$requisitionId]);
    } else if ($totalReturned > 0) {
        $this->pdo->prepare("UPDATE requisitions SET status = 'returned', date_returned = NOW() WHERE id = ?")
            ->execute([$requisitionId]);
    } else if ($totalReturned === 0 && $totalLost === 0 && $totalQuantity > 0 && $outstanding === 0) {
        // All items consumable, nothing returned → mark as returned (displayed as consumed)
        $this->pdo->prepare("UPDATE requisitions SET status = 'returned', date_returned = NULL WHERE id = ?")
            ->execute([$requisitionId]);
    }
}

public function isConsumed($requisitionId) {
    // Check if all items are consumable and nothing returned/lost
    $stmt = $this->pdo->prepare("
        SELECT 
            COUNT(*) as total_items,
            SUM(CASE WHEN is_consumable = 1 THEN 1 ELSE 0 END) as consumable_items,
            SUM(returned_quantity) as total_returned,
            SUM(quantity_lost) as total_lost
        FROM requisition_items 
        WHERE requisition_id = ?
    ");
    $stmt->execute([$requisitionId]);
    $result = $stmt->fetch();
    
    if ((int)$result['total_items'] === 0) {
        return false;
    }
    
    $allConsumable = (int)$result['consumable_items'] === (int)$result['total_items'];
    $nothingReturned = (int)$result['total_returned'] === 0 && (int)$result['total_lost'] === 0;
    
    return $allConsumable && $nothingReturned;
}

public function getApproved() {
    $stmt = $this->pdo->query("
        SELECT DISTINCT r.*
        FROM {$this->table} r 
        JOIN requisition_items ri ON r.id = ri.requisition_id 
        WHERE r.status = 'approved' AND ri.is_consumable = 0 
        ORDER BY r.id DESC
    ");
    $requisitions = $stmt->fetchAll();
    foreach ($requisitions as &$req) {
        $items = $this->getItems($req['id']);
        $filteredItems = [];
        foreach ($items as $item) {
            if ($item['is_consumable'] == 0) {
                $filteredItems[] = $item;
            }
        }
        $req['items'] = $filteredItems;
    }
    return $requisitions;
}

    public function clearAll() {
        return $this->pdo->exec("DELETE FROM {$this->table}");
    }

    public function clearConsumed() {
    // Get IDs first
    $stmt = $this->pdo->query("
        SELECT r.id 
        FROM {$this->table} r
        JOIN requisition_items ri ON r.id = ri.requisition_id
        GROUP BY r.id
        HAVING SUM(CASE WHEN ri.is_consumable = 0 THEN 1 ELSE 0 END) = 0 
        AND SUM(ri.returned_quantity) = 0 
        AND SUM(ri.quantity_lost) = 0
    ");
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($ids)) {
        return 0;
    }
    
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $deleteStmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id IN ($placeholders)");
    return $deleteStmt->execute($ids);
}

public function clearReturned() {
    // Get IDs of requisitions with status 'returned' but NOT fully consumed
    $stmt = $this->pdo->query("
        SELECT r.id 
        FROM {$this->table} r
        JOIN requisition_items ri ON r.id = ri.requisition_id
        WHERE r.status = 'returned'
        GROUP BY r.id
        HAVING SUM(CASE WHEN ri.is_consumable = 0 AND ri.returned_quantity + ri.quantity_lost < ri.quantity THEN 1 ELSE 0 END) = 0
        AND SUM(ri.returned_quantity) > 0
    ");
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($ids)) {
        return 0;
    }
    
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $deleteStmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id IN ($placeholders)");
    return $deleteStmt->execute($ids);
}
}
