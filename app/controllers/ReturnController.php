<?php
class ReturnController extends Controller {
    private $model;

    public function __construct() {
        require_once '../app/models/Return.php';
        $this->model = new ReturnModel();
    }

    public function index() {
        $this->requireAdmin();
        $returns = $this->model->allWithRequestor();
        $this->json($returns);
    }

    public function process() {
        $this->requireAdmin();
        
        $requisition_id = $_POST['requisition_id'];
        $return_date = $_POST['return_date'];
        $checked_by = $_POST['checked_by'] ?: null;
        $remarks = $_POST['remarks'] ?: null;
        $items = json_decode($_POST['items'], true);

        try {
            foreach ($items as $item) {
                $this->model->processReturn(
                    $requisition_id, 
                    $item['id'], 
                    $item['qty_returned'], 
                    $item['qty_lost'], 
                    $return_date, 
                    $checked_by, 
                    $remarks
                );
            }
            $this->json(['success' => true]);
        } catch (Exception $e) {
            $this->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function clear() {
        $this->requireAdmin();
        $this->model->clearAll();
        $this->json(['success' => true]);
    }
}