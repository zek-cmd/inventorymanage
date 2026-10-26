-- =====================================================================
-- Inventory System - Unified Database Schema
-- =====================================================================
-- Single source of truth for the `inventory_system` schema.
--
-- This file is the original phpMyAdmin structural dump (server 8.0.30,
-- generated Aug 28, 2026) merged with database_migration_preserve_return_history.sql,
-- so one fresh import gives you the fully migrated structure. The separate
-- migration file is no longer needed and has been merged in and removed.
--
-- What the merge added to the base dump:
--   1. `returns`.`requestor_name` (VARCHAR(100) NULL) - a snapshot of the
--      requestor's name captured when the return is recorded, so return
--      history survives deletion of the parent requisition.
--   2. `returns`.`requisition_id` has NO foreign key (the migration dropped
--      `returns_ibfk_1`). This is what lets a requisition be deleted while its
--      returns are preserved. The plain index `requisition_id` remains.
--   3. `requisition_items`.`requisition_id` KEEPS its ON DELETE CASCADE
--      foreign key, so a requisition's line items are removed with it.
--
-- Migration statements that are already reflected above (do NOT re-run them
-- against a schema created from this file):
--   ALTER TABLE `returns` ADD COLUMN `requestor_name` VARCHAR(100) NULL
--     AFTER `requisition_id`;
--   UPDATE `returns` AS r LEFT JOIN `requisitions` AS req
--     ON req.`id` = r.`requisition_id`
--     SET r.`requestor_name` = req.`name` WHERE r.`requestor_name` IS NULL;
--   ALTER TABLE `returns` DROP FOREIGN KEY `returns_ibfk_1`;
--
-- Usage:
--   mysql -u root inventory_system < inventory_system.sql
--   (or import this file in phpMyAdmin)
--
-- This is a FRESH-INSTALL script. The tables are created without
-- IF NOT EXISTS on purpose: importing it over a database that already has
-- these tables stops immediately with "table already exists" instead of
-- silently leaving you on a half-applied schema. To rebuild from scratch,
-- drop the database first:
--   DROP DATABASE IF EXISTS `inventory_system`;
--   then import this file.
--
-- The CREATE DATABASE / USE lines below target the name hardcoded in
-- config/database.php (DB_NAME = 'inventory_system'). Remove them if you
-- intentionally import into a differently named database.
-- =====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_system`
--

CREATE DATABASE IF NOT EXISTS `inventory_system`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `inventory_system`;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `date_added` date DEFAULT NULL,
  `is_consumable` tinyint(1) NOT NULL DEFAULT '0',
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requisitions`
--

CREATE TABLE `requisitions` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date_returned` date DEFAULT NULL,
  `status` enum('pending','approved','rejected','returned','lost') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `approved_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requisition_items`
--

CREATE TABLE `requisition_items` (
  `id` int NOT NULL,
  `requisition_id` int NOT NULL,
  `item` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL,
  `returned_quantity` int NOT NULL DEFAULT '0',
  `quantity_lost` int NOT NULL DEFAULT '0',
  `date_received` date DEFAULT NULL,
  `is_consumable` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--
-- `requestor_name` is intentionally denormalised (merged from the migration:
-- preserve return history). `requisition_id` deliberately has no foreign key,
-- so deleting a requisition does not cascade away its return records.
--

CREATE TABLE `returns` (
  `id` int NOT NULL,
  `requisition_id` int DEFAULT NULL,
  `requestor_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `item` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity_returned` int NOT NULL,
  `quantity_lost` int NOT NULL DEFAULT '0',
  `return_date` date NOT NULL,
  `checked_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'employee',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requisitions`
--
ALTER TABLE `requisitions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requisition_items`
--
ALTER TABLE `requisition_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requisition_id` (`requisition_id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requisition_id` (`requisition_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisitions`
--
ALTER TABLE `requisitions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisition_items`
--
ALTER TABLE `requisition_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `requisition_items`
--
-- Line items belong to a requisition and are removed with it.
--
ALTER TABLE `requisition_items`
  ADD CONSTRAINT `requisition_items_ibfk_1` FOREIGN KEY (`requisition_id`) REFERENCES `requisitions` (`id`) ON DELETE CASCADE;

--
-- NOTE: there is intentionally no constraint on `returns`.`requisition_id`.
-- The migration dropped `returns_ibfk_1` so that return history outlives the
-- requisition it came from. Do not re-add it.
--

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
