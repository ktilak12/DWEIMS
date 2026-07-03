-- ==============================
-- DATABASE CREATION
-- ==============================
CREATE DATABASE DefenceInventoryDB;
USE DefenceInventoryDB;

-- ==============================
-- TABLES
-- ==============================

CREATE TABLE DefenceUnit (
    Unit_ID INT PRIMARY KEY,
    Unit_Name VARCHAR(50) NOT NULL,
    Unit_Type VARCHAR(30),
    Location VARCHAR(50)
);

CREATE TABLE EquipmentCategory (
    Category_ID INT PRIMARY KEY,
    Category_Name VARCHAR(40) NOT NULL,
    Description VARCHAR(100)
);

CREATE TABLE Equipment (
    Equipment_ID INT PRIMARY KEY,
    Equipment_Name VARCHAR(50) NOT NULL,
    Serial_Number VARCHAR(40) UNIQUE,
    Category_ID INT,
    Status VARCHAR(20),
    FOREIGN KEY (Category_ID) REFERENCES EquipmentCategory(Category_ID)
);

CREATE TABLE StorageLocation (
    Storage_ID INT PRIMARY KEY,
    Location_Name VARCHAR(50) NOT NULL,
    Security_Level VARCHAR(20)
);

CREATE TABLE Inventory (
    Inventory_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Quantity INT NOT NULL,
    Storage_ID INT,
    FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID),
    FOREIGN KEY (Storage_ID) REFERENCES StorageLocation(Storage_ID)
);

CREATE TABLE IssueRecord (
    Issue_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Unit_ID INT,
    Issue_Date DATE,
    Issued_Quantity INT,
    Expected_Return DATE,
    FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID),
    FOREIGN KEY (Unit_ID) REFERENCES DefenceUnit(Unit_ID)
);

CREATE TABLE ReturnRecord (
    Return_ID INT PRIMARY KEY,
    Issue_ID INT,
    Return_Date DATE,
    Returned_Quantity INT,
    FOREIGN KEY (Issue_ID) REFERENCES IssueRecord(Issue_ID)
);

CREATE TABLE Maintenance (
    Maintenance_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Maintenance_Date DATE,
    Maintenance_Type VARCHAR(40),
    Condition_Status VARCHAR(20),
    FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID)
);

CREATE TABLE Supplier (
    Supplier_ID INT PRIMARY KEY,
    Supplier_Name VARCHAR(50) NOT NULL,
    Contact_Details VARCHAR(60)
);

CREATE TABLE Procurement (
    Procurement_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Supplier_ID INT,
    Purchase_Date DATE,
    Quantity INT,
    FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID),
    FOREIGN KEY (Supplier_ID) REFERENCES Supplier(Supplier_ID)
);

CREATE TABLE AuthorizedPersonnel (
    Personnel_ID INT PRIMARY KEY,
    Person_Name VARCHAR(40) NOT NULL,
    Role VARCHAR(30),
    Rank_Name VARCHAR(30),
    Username VARCHAR(50),
    Password VARCHAR(255)
);

CREATE TABLE AuditLog (
    Audit_ID INT PRIMARY KEY,
    Inventory_ID INT,
    Audit_Date DATE,
    Remarks VARCHAR(100),
    FOREIGN KEY (Inventory_ID) REFERENCES Inventory(Inventory_ID)
);

-- ==============================
-- INSERT DEFENCE UNITS
-- ==============================

INSERT INTO DefenceUnit VALUES
(1, 'Infantry Unit A', 'Infantry', 'Northern Command'),
(2, 'Armoured Unit B', 'Armoured', 'Western Command'),
(3, 'Artillery Unit C', 'Artillery', 'Northern Command'),
(4, 'Air Defence Unit D', 'Air Defence', 'Western Command');

-- ==============================
-- INSERT EQUIPMENT CATEGORIES
-- ==============================

INSERT INTO EquipmentCategory VALUES
(1, 'Firearms', 'Small arms and automatic weapons'),
(2, 'Heavy Weapons', 'Artillery and heavy defence weapons'),
(3, 'Ammunition', 'Bullets, shells, and explosive ordnance'),
(4, 'Vehicles', 'Military vehicles and transport equipment'),
(5, 'Air Systems', 'Drones, UAVs, and aerial surveillance');

-- ==============================
-- INSERT EQUIPMENT
-- ==============================

INSERT INTO Equipment VALUES
-- Firearms
(1, 'Assault Rifle', 'AR556-001', 1, 'Active'),
(2, 'Machine Gun', 'MG762-002', 1, 'Active'),
(3, 'Sniper Rifle', 'SR338-004', 1, 'Active'),
(4, 'Pistol', 'PT9MM-005', 1, 'Active'),
(5, 'Submachine Gun', 'SMG45-006', 1, 'Active'),

-- Heavy Weapons
(6, 'Howitzer', 'HW155-003', 2, 'Active'),
(7, 'Rocket Launcher', 'RL84MM-007', 2, 'Active'),
(8, 'Mortar', 'MT120MM-008', 2, 'Under Maintenance'),
(9, 'Anti-Tank Missile', 'ATM148-009', 2, 'Active'),

-- Ammunition
(10, '5.56mm Ammunition', 'AM556-010', 3, 'Active'),
(11, '7.62mm Ammunition', 'AM762-011', 3, 'Active'),
(12, '155mm Artillery Shell', 'AS155-012', 3, 'Active'),
(13, '84mm Rocket', 'RK84-013', 3, 'Active'),
(14, '120mm Mortar Bomb', 'MB120-014', 3, 'Active'),

-- Vehicles
(15, 'Battle Tank', 'BT120-015', 4, 'Active'),
(16, 'Armoured Personnel Carrier', 'APC6X6-016', 4, 'Active'),
(17, 'Utility Truck', 'UT4X4-017', 4, 'Under Maintenance'),
(18, 'Reconnaissance Vehicle', 'RV4WD-018', 4, 'Active'),

-- Air Systems
(19, 'Combat Drone', 'CDRQ9-019', 5, 'Active'),
(20, 'Surveillance Drone', 'SDRQ11-020', 5, 'Active');

-- ==============================
-- INSERT STORAGE LOCATIONS
-- ==============================

INSERT INTO StorageLocation VALUES
(1, 'Central Armory', 'High'),
(2, 'Forward Base Store', 'Medium'),
(3, 'Northern Depot', 'High'),
(4, 'Western Arsenal', 'High');

-- ==============================
-- INSERT INVENTORY
-- ==============================

INSERT INTO Inventory VALUES
-- Central Armory (Storage_ID = 1)
(1, 1, 15, 1),    -- Assault Rifle
(2, 2, 15, 1),    -- Machine Gun
(3, 3, 15, 1),    -- Sniper Rifle
(4, 4, 15, 1),    -- Pistol
(5, 5, 15, 1),    -- Submachine Gun
(6, 10, 15, 1),  -- 5.56mm Ammunition
(7, 11, 15, 1),  -- 7.62mm Ammunition

-- Forward Base Store (Storage_ID = 2)
(8, 6, 15, 2),     -- Howitzer
(9, 7, 15, 2),    -- Rocket Launcher
(10, 8, 15, 2),   -- Mortar
(11, 9, 15, 2),   -- Anti-Tank Missile
(12, 12, 15, 2), -- 155mm Artillery Shell
(13, 13, 15, 2), -- 84mm Rocket
(14, 14, 15, 2), -- 120mm Mortar Bomb

-- Northern Depot (Storage_ID = 3)
(15, 15, 15, 3),   -- Battle Tank
(16, 16, 15, 3),  -- Armoured Personnel Carrier
(17, 17, 15, 3),  -- Utility Truck
(18, 18, 15, 3),  -- Reconnaissance Vehicle
(19, 19, 15, 3),  -- Combat Drone
(20, 20, 15, 3);  -- Surveillance Drone

-- ==============================
-- INSERT SUPPLIERS
-- ==============================

INSERT INTO Supplier VALUES
(1, 'Defence Arms Ltd', 'defencearms@gmail.com'),
(2, 'National Weapon Corp', 'nwc_support@gmail.com'),
(3, 'Northern Munitions', 'northmunitions@defence.gov'),
(4, 'AeroDef Systems', 'aerodef@defence.gov');

-- ==============================
-- INSERT PROCUREMENT
-- ==============================

INSERT INTO Procurement VALUES
(1, 1, 1, '2026-02-15', 15),
(2, 2, 1, '2026-02-16', 15),
(3, 6, 2, '2026-02-20', 15),
(4, 10, 3, '2026-02-22', 15),
(5, 11, 3, '2026-02-22', 15),
(6, 15, 2, '2026-02-25', 15),
(7, 19, 4, '2026-03-01', 15),
(8, 20, 4, '2026-03-01', 15),
(9, 7, 1, '2026-03-05', 15),
(10, 9, 2, '2026-03-10', 15);

-- ==============================
-- INSERT ISSUE RECORDS
-- ==============================

INSERT INTO IssueRecord VALUES
(1, 1, 1, '2026-03-01', 5, '2026-04-01'),
(2, 2, 2, '2026-03-02', 5, '2026-04-02'),
(3, 7, 1, '2026-03-05', 5, '2026-04-05'),
(4, 10, 1, '2026-03-06', 5, '2026-04-06'),
(5, 11, 2, '2026-03-07', 5, '2026-04-07'),
(6, 19, 4, '2026-03-10', 5, '2026-04-10'),
(7, 6, 3, '2026-03-12', 5, '2026-04-12'),
(8, 3, 1, '2026-03-15', 5, '2026-04-15');

-- ==============================
-- INSERT RETURN RECORDS
-- ==============================

INSERT INTO ReturnRecord VALUES
(1, 1, '2026-03-10', 2),
(2, 2, '2026-03-12', 2),
(3, 3, '2026-03-15', 2),
(4, 4, '2026-03-16', 2),
(5, 5, '2026-03-17', 2),
(6, 8, '2026-03-20', 2);

-- ==============================
-- INSERT MAINTENANCE RECORDS
-- ==============================

INSERT INTO Maintenance VALUES
(1, 3, '2026-03-05', 'Routine Check', 'Operational'),
(2, 2, '2026-03-08', 'Repair', 'Good'),
(3, 8, '2026-03-10', 'Barrel Inspection', 'Under Repair'),
(4, 15, '2026-03-12', 'Engine Service', 'Good'),
(5, 17, '2026-03-14', 'Transmission Repair', 'Under Maintenance'),
(6, 19, '2026-03-16', 'Firmware Update', 'Operational'),
(7, 20, '2026-03-18', 'Camera Calibration', 'Operational'),
(8, 6, '2026-03-20', 'Hydraulic Check', 'Good');

-- ==============================
-- INSERT AUTHORIZED PERSONNEL
-- ==============================

INSERT INTO AuthorizedPersonnel VALUES
(1, 'Ravi Kumar', 'Admin', 'Captain', 'admin', '$2b$10$2a19GgdUvYeWLG1CVOOoGeWEmPvLp0jHp3K2VoJ6rxu6T54nHfZie'),
(2, 'Anil Sharma', 'Officer', 'Major', 'anil', '$2b$10$2a19GgdUvYeWLG1CVOOoGeWEmPvLp0jHp3K2VoJ6rxu6T54nHfZie'),
(3, 'Priya Singh', 'Logistics Head', 'Colonel', NULL, NULL),
(4, 'Vikram Mehta', 'Armory Supervisor', 'Lieutenant', NULL, NULL),
(5, 'Sunil Dutt', 'Maintenance Chief', 'Major', NULL, NULL),
(6, 'Neha Gupta', 'Procurement Officer', 'Captain', NULL, NULL);

-- ==============================
-- INSERT AUDIT LOGS
-- ==============================

INSERT INTO AuditLog VALUES
(1, 1, '2026-03-15', 'Inventory verified - All items accounted'),
(2, 8, '2026-03-18', 'Maintenance record audited'),
(3, 15, '2026-03-20', 'Vehicle inventory audit completed'),
(4, 19, '2026-03-22', 'Drone systems verification passed'),
(5, 10, '2026-03-25', 'Ammunition count verified');

-- ==============================
-- ADD CHECK CONSTRAINT
-- ==============================

ALTER TABLE Inventory
ADD CONSTRAINT chk_quantity
CHECK (Quantity >= 0);

-- ==============================
-- QUERIES
-- ==============================

-- Total Inventory Summary
SELECT SUM(Quantity) AS Total_Inventory
FROM Inventory;

-- Equipment issued (INTERSECT query)
SELECT Equipment_ID FROM Inventory
INTERSECT
SELECT Equipment_ID FROM IssueRecord;

-- Equipment with above average quantity
SELECT Equipment_ID, Quantity
FROM Inventory
WHERE Quantity > (
    SELECT AVG(Quantity) FROM Inventory
);

-- Equipment issued with unit details
SELECT E.Equipment_Name, D.Unit_Name, I.Issue_Date, I.Issued_Quantity
FROM Equipment E
JOIN IssueRecord I ON E.Equipment_ID = I.Equipment_ID
JOIN DefenceUnit D ON I.Unit_ID = D.Unit_ID;

-- ==============================
-- CREATE VIEW
-- ==============================

CREATE VIEW EquipmentInventoryView AS
SELECT E.Equipment_Name, E.Serial_Number, C.Category_Name,
       I.Quantity, S.Location_Name, S.Security_Level
FROM Equipment E
JOIN Inventory I ON E.Equipment_ID = I.Equipment_ID
JOIN StorageLocation S ON I.Storage_ID = S.Storage_ID
JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID;

-- ==============================
-- TRIGGERS FOR AUTO INVENTORY UPDATE
-- ==============================

DELIMITER $$

CREATE TRIGGER update_inventory
AFTER INSERT ON IssueRecord
FOR EACH ROW
BEGIN
   UPDATE Inventory
   SET Quantity = Quantity - NEW.Issued_Quantity
   WHERE Equipment_ID = NEW.Equipment_ID AND Quantity >= NEW.Issued_Quantity
   LIMIT 1;
END $$

CREATE TRIGGER return_inventory
AFTER INSERT ON ReturnRecord
FOR EACH ROW
BEGIN
   DECLARE eq_id INT;
   SELECT Equipment_ID INTO eq_id FROM IssueRecord WHERE Issue_ID = NEW.Issue_ID;
   
   UPDATE Inventory
   SET Quantity = Quantity + NEW.Returned_Quantity
   WHERE Equipment_ID = eq_id
   LIMIT 1;
END $$

DELIMITER ;

-- ==============================
-- STORED PROCEDURE WITH CURSOR
-- ==============================

DELIMITER $$

CREATE PROCEDURE DisplayEquipment()
BEGIN
   DECLARE done INT DEFAULT 0;
   DECLARE eq_name VARCHAR(50);
   DECLARE qty INT;
   DECLARE cat_name VARCHAR(40);

   DECLARE cur CURSOR FOR
   SELECT E.Equipment_Name, I.Quantity, C.Category_Name
   FROM Equipment E
   JOIN Inventory I ON E.Equipment_ID = I.Equipment_ID
   JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
   ORDER BY C.Category_Name, E.Equipment_Name;

   DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

   OPEN cur;

   read_loop: LOOP
      FETCH cur INTO eq_name, qty, cat_name;
      IF done THEN
         LEAVE read_loop;
      END IF;
      SELECT CONCAT(cat_name, ' - ', eq_name, ': ', qty, ' units') AS Inventory_Status;
   END LOOP;

   CLOSE cur;
END $$

DELIMITER ;

-- ==============================
-- ADDITIONAL USEFUL QUERIES
-- ==============================

-- Inventory by Category
SELECT C.Category_Name, SUM(I.Quantity) AS Total_Quantity
FROM Inventory I
JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
GROUP BY C.Category_Name
ORDER BY Total_Quantity DESC;

-- Low Stock Alert (less than 100 units, excluding ammunition)
SELECT E.Equipment_Name, I.Quantity, S.Location_Name
FROM Inventory I
JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
JOIN StorageLocation S ON I.Storage_ID = S.Storage_ID
WHERE I.Quantity < 100
AND E.Category_ID NOT IN (3)  -- Exclude ammunition
ORDER BY I.Quantity ASC;

-- Maintenance Summary
SELECT E.Equipment_Name, M.Maintenance_Type, M.Condition_Status, M.Maintenance_Date
FROM Maintenance M
JOIN Equipment E ON M.Equipment_ID = E.Equipment_ID
ORDER BY M.Maintenance_Date DESC;

-- ==============================
-- EXECUTE PROCEDURES AND VIEWS
-- ==============================

CALL DisplayEquipment();
SELECT * FROM EquipmentInventoryView;
