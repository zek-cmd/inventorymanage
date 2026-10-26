<?php
class User extends Model {
    protected $table = 'users';

    public function findByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function findByUsernameExcept($username, $id) {
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE username = ? AND id != ?");
        $stmt->execute([$username, $id]);
        return $stmt->fetch();
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT id, username, name, role, created_at FROM {$this->table} ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    public function create($username, $password, $name, $role) {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (username, password, name, role) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$username, $password, $name, $role]);
    }

    public function update($id, $username, $password, $name, $role) {
        if ($password) {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET username = ?, password = ?, name = ?, role = ? WHERE id = ?");
            return $stmt->execute([$username, $password, $name, $role, $id]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET username = ?, name = ?, role = ? WHERE id = ?");
            return $stmt->execute([$username, $name, $role, $id]);
        }
    }
}