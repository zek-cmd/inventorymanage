<?php
class BackupController extends Controller {
    public function download() {
        $this->requireAdmin();

        global $pdo;
        $tables = ['inventory', 'requisitions', 'requisition_items', 'returns'];
        $filename = 'inventory_backup_' . date('Y-m-d_His') . '.sql';

        header('Content-Type: application/sql; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store, no-cache, must-revalidate');
        header('X-Suggested-Filename: ' . $filename);

        echo "-- Inventory System data backup\n";
        echo "-- Generated: " . gmdate('Y-m-d H:i:s') . " UTC\n";
        echo "-- Contains data only; table structures and user accounts are excluded.\n\n";
        echo "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\nSTART TRANSACTION;\n\n";

        foreach ($tables as $table) {
            $statement = $pdo->query("SELECT * FROM `{$table}` ORDER BY `id` ASC");
            $wroteRows = false;

            while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
                if (!$wroteRows) {
                    echo "-- Data for `{$table}`\n";
                    $wroteRows = true;
                }
                $columns = array_map(function ($column) {
                    return '`' . str_replace('`', '``', $column) . '`';
                }, array_keys($row));
                $values = array_map(function ($value) use ($pdo) {
                    return $value === null ? 'NULL' : $pdo->quote((string)$value);
                }, array_values($row));
                echo "INSERT INTO `{$table}` (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n";
            }

            if (!$wroteRows) {
                echo "-- No data in `{$table}`\n";
            }
            echo "\n";
        }

        echo "COMMIT;\nSET FOREIGN_KEY_CHECKS=1;\n";
        exit;
    }
}
