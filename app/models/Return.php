<?php
class ReturnModel extends Model {
    protected $table = 'returns';

    public function all() {
        return $this->query("SELECT * FROM returns ORDER BY created_at DESC")->fetchAll();
    }

    public function allWithRequestor() {
        return $this->query("SELECT r.*, COALESCE(r.requestor_name, req.name) AS name, req.date AS request_date,
                                    req.department, req.position, req.note AS requisition_note,
                                    req.status AS requisition_status, req.approved_by,
                                    req.date_returned AS requisition_date_returned
                             FROM returns r 
                             LEFT JOIN requisitions req ON r.requisition_id = req.id 
                             ORDER BY r.created_at DESC")->fetchAll();
    }

    public function processReturn($requisition_id, $requisition_item_id, $quantity_returned, $quantity_lost, $return_date, $checked_by, $remarks) {
        $item = $this->query("SELECT * FROM requisition_items WHERE id = ?", [$requisition_item_id])->fetch();
        $requisition = $this->query("SELECT name FROM requisitions WHERE id = ?", [$requisition_id])->fetch();

        if (!$item || !$requisition) {
            throw new Exception('The selected requisition or item no longer exists.');
        }
        
        $totalResolved = $item['returned_quantity'] + $item['quantity_lost'];
        $remainingToReturn = $item['quantity'] - $totalResolved;
        
        if (($quantity_returned + $quantity_lost) > $remainingToReturn) {
            throw new Exception('Return quantity plus lost quantity exceeds remaining borrowed quantity!');
        }

        if ($quantity_returned < 0 || $quantity_lost < 0) {
            throw new Exception('Quantities cannot be negative!');
        }

        if ($quantity_returned == 0 && $quantity_lost == 0) {
            throw new Exception('Please enter at least one quantity (returned or lost).');
        }

        // Restore returned quantity to inventory
        if ($quantity_returned > 0) {
            $invStmt = $this->pdo->prepare("SELECT * FROM inventory WHERE item = ?");
            $invStmt->execute([$item['item']]);
            $invItem = $invStmt->fetch();

            if ($invItem) {
                $newQuantity = $invItem['quantity'] + $quantity_returned;
                $updateStmt = $this->pdo->prepare("UPDATE inventory SET quantity = ? WHERE id = ?");
                $updateStmt->execute([$newQuantity, $invItem['id']]);
            }
        }

        // Update requisition_item returned_quantity and quantity_lost
        $newReturnedQuantity = $item['returned_quantity'] + $quantity_returned;
        $newLostQuantity = $item['quantity_lost'] + $quantity_lost;
        $this->query("UPDATE requisition_items SET returned_quantity = ?, quantity_lost = ? WHERE id = ?", [$newReturnedQuantity, $newLostQuantity, $requisition_item_id]);

        // Insert into returns table
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (requisition_id, requestor_name, item, quantity_returned, quantity_lost, return_date, checked_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$requisition_id, $requisition['name'], $item['item'], $quantity_returned, $quantity_lost, $return_date, $checked_by, $remarks]);

        // Update requisition status based on current item states
require_once '../app/models/Requisition.php';
$requisitionModel = new Requisition();
$requisitionModel->updateStatusBasedOnItems($requisition_id);

        return true;
    }

   public function clearAll() {
    return $this->pdo->exec("DELETE FROM {$this->table}");
}
}
