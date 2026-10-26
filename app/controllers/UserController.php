<?php
class UserController extends Controller {
    private $model;

    public function __construct() {
        require_once '../app/models/User.php';
        $this->model = new User();
    }

    public function index() {
        $this->requireAdmin();
        $users = $this->model->getAll();
        $this->json($users);
    }

    public function get() {
        $this->requireAdmin();
        $id = $_GET['id'] ?? 0;
        $user = $this->model->find($id);
        unset($user['password']);
        $this->json($user);
    }

    public function add() {
        $this->requireAdmin();
        
        $username = $_POST['username'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $name = $_POST['name'];
        $role = $_POST['role'];

        $existing = $this->model->findByUsername($username);
        if ($existing) {
            $this->json(['success' => false, 'message' => 'Username already exists']);
            return;
        }

        $this->model->create($username, $password, $name, $role);
        $this->json(['success' => true]);
    }

    public function update() {
        $this->requireAdmin();
        
        $id = $_POST['id'];
        $username = $_POST['username'];
        $name = $_POST['name'];
        $role = $_POST['role'];

        $existing = $this->model->findByUsernameExcept($username, $id);
        if ($existing) {
            $this->json(['success' => false, 'message' => 'Username already exists']);
            return;
        }

        $password = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : null;
        $this->model->update($id, $username, $password, $name, $role);
        $this->json(['success' => true]);
    }

    public function delete() {
        $this->requireAdmin();
        
        $id = $_POST['id'];
        
        if ($id == Session::get('user_id')) {
            $this->json(['success' => false, 'message' => 'Cannot delete your own account']);
            return;
        }

        $this->model->delete($id);
        $this->json(['success' => true]);
    }
}