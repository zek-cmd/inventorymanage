<?php
class InventoryController extends Controller {
    private $model;

    public function __construct() {
        require_once '../app/models/Inventory.php';
        $this->model = new Inventory();
    }

    public function index() {
        $this->requireAuth();
        $items = $this->model->all();
        $this->json($items);
    }

    public function get() {
        $this->requireAuth();
        $id = $_GET['id'] ?? 0;
        $item = $this->model->find($id);
        $this->json($item);
    }

    public function add() {
        $this->requireAdmin();
        
        $item = trim($_POST['item'] ?? '');
        $quantity = $this->normalizeQuantity($_POST['quantity'] ?? null);
        $date_added = $_POST['date_added'] ?: date('Y-m-d');
        $is_consumable = $_POST['is_consumable'] ?? 0;
        $category = $_POST['category'] ?? '';

        if ($item === '') {
            http_response_code(400);
            $this->json(['success' => false, 'message' => 'Item name is required.']);
            return;
        }

        if ($quantity === null) {
            http_response_code(400);
            $this->json(['success' => false, 'message' => 'Quantity must be a whole number of 0 or more.']);
            return;
        }

        $this->model->create($item, $quantity, $date_added, $is_consumable, $category);
        $this->json(['success' => true]);
    }

    public function update() {
        $this->requireAdmin();
        
        $id = $_POST['id'];
        $item = trim($_POST['item'] ?? '');
        $quantity = $this->normalizeQuantity($_POST['quantity'] ?? null);
        $date_added = $_POST['date_added'] ?: null;
        $is_consumable = $_POST['is_consumable'] ?? 0;
        $category = $_POST['category'] ?? '';

        if ($item === '') {
            http_response_code(400);
            $this->json(['success' => false, 'message' => 'Item name is required.']);
            return;
        }

        if ($quantity === null) {
            http_response_code(400);
            $this->json(['success' => false, 'message' => 'Quantity must be a whole number of 0 or more.']);
            return;
        }

        try {
            $this->model->update($id, $item, $quantity, $date_added, $is_consumable, $category);
            $this->json(['success' => true]);
        } catch (Exception $e) {
            http_response_code(400);
            $this->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * Quantity 0 is valid: it marks the item as Out of Stock.
     * Returns null when the value is missing, non-numeric or negative so callers can reject it.
     */
    private function normalizeQuantity($value) {
        if ($value === null || $value === '' || !is_numeric($value)) {
            return null;
        }

        $quantity = (int)$value;

        return $quantity < 0 ? null : $quantity;
    }

    public function delete() {
        $this->requireAdmin();
        
        $id = $_POST['id'];
        $this->model->delete($id);
        $this->json(['success' => true]);
    }
}
