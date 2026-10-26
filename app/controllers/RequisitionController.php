<?php
class RequisitionController extends Controller {
    private $model;

    public function __construct() {
        require_once '../app/models/Requisition.php';
        $this->model = new Requisition();
    }

    public function index() {
        $this->requireAdmin();
        $requisitions = $this->model->allWithItems();
        $this->json($requisitions);
    }

    public function approved() {
        $this->requireAdmin();
        $requisitions = $this->model->getApproved();
        $this->json($requisitions);
    }

    public function submit() {
        $this->requireAuth();
        
        $name = $_POST['name'];
        $date = $_POST['date'];
        $department = $_POST['department'];
        $position = $_POST['position'];
        $note = $_POST['note'] ?: null;
        $items = json_decode($_POST['items'], true);

        $requisitionId = $this->model->create($name, $date, $department, $position, $note);

        foreach ($items as $item) {
          $this->model->addItem(
    $requisitionId,
    $item['item'],
    $item['quantity'],
    $item['is_consumable'] ?? 0
);
        }

        $this->json(['success' => true]);
    }

    public function status() {
        $this->requireAdmin();
        
        $id = $_POST['id'];
        $status = $_POST['status'];
        $approvedBy = Session::get('name');

        $this->model->updateStatus($id, $status, $approvedBy);
        
        if ($status === 'approved') {
            $this->model->deductInventory($id);
        }

        $this->json(['success' => true]);
    }

    public function toggleItem() {
    $this->requireAdmin();
    
    $itemId = $_POST['item_id'] ?? 0;
    $isConsumable = $_POST['is_consumable'] ?? 0;
    
    $result = $this->model->toggleItemConsumable($itemId, $isConsumable);
    
    if ($result) {
        $this->json(['success' => true]);
    } else {
        $this->json(['success' => false, 'message' => 'Item not found']);
    }
}

public function updateNote() {
    $this->requireAdmin();
    $requisitionId = filter_input(INPUT_POST, 'requisition_id', FILTER_VALIDATE_INT);
    $note = trim($_POST['note'] ?? '');

    if (!$requisitionId || strlen($note) > 2000) {
        http_response_code(422);
        $this->json(['success' => false, 'message' => 'Invalid requisition note. Notes may contain up to 2,000 characters.']);
        return;
    }
    if (!$this->model->updateNote($requisitionId, $note)) {
        http_response_code(404);
        $this->json(['success' => false, 'message' => 'Requisition not found.']);
        return;
    }
    $this->json(['success' => true, 'note' => $note]);
}

public function clearByType() {
    $this->requireAdmin();
    
    $type = $_POST['type'] ?? '';
    
    if ($type === 'returned') {
        $this->model->clearReturned();
        $this->json(['success' => true]);
    } else if ($type === 'consumed') {
        $this->model->clearConsumed();
        $this->json(['success' => true]);
    } else {
        $this->json(['success' => false, 'message' => 'Invalid type']);
    }
}

    public function items() {
        $this->requireAdmin();
        $id = $_GET['id'] ?? 0;
        $items = $this->model->getItems($id);
        $this->json($items);
    }

    public function report() {
        $this->requireAdmin();

        $fromDate = $_GET['from_date'] ?? '';
        $toDate = $_GET['to_date'] ?? '';
        $preparedBy = trim($_GET['prepared_by'] ?? '');
        $selectedIds = array_filter(array_map('intval', explode(',', $_GET['ids'] ?? '')));

        if (empty($selectedIds) && (!$this->isValidDate($fromDate) || !$this->isValidDate($toDate) || $fromDate > $toDate)) {
            http_response_code(422);
            $this->json(['success' => false, 'message' => 'Please provide a valid date range.']);
            return;
        }

        if ($preparedBy === '' || strlen($preparedBy) > 100) {
            http_response_code(422);
            $this->json(['success' => false, 'message' => 'Please provide a valid Prepared By name.']);
            return;
        }

        $requisitions = !empty($selectedIds)
            ? $this->model->getByIds($selectedIds)
            : $this->model->getByDateRange($fromDate, $toDate);
        $this->view('requisition_report', [
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'preparedBy' => $preparedBy,
            'requisitions' => $requisitions,
            'isSelectedReport' => !empty($selectedIds)
        ]);
    }

    private function isValidDate($date) {
        $parsed = DateTime::createFromFormat('Y-m-d', $date);
        return $parsed && $parsed->format('Y-m-d') === $date;
    }

    public function clear() {
        $this->requireAdmin();
        $this->model->clearAll();
        $this->json(['success' => true]);
    }
}
