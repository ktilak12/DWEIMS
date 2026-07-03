CREATE TABLE Inventory (
    Inventory_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Quantity INT NOT NULL
);

CREATE TABLE IssueRecord (
    Issue_ID INT PRIMARY KEY,
    Equipment_ID INT,
    Issued_Quantity INT
);

INSERT INTO Inventory VALUES (1, 1, 450), (2, 1, 320);

DELIMITER $$
CREATE TRIGGER update_inventory BEFORE INSERT ON IssueRecord
FOR EACH ROW
BEGIN
   UPDATE Inventory
   SET Quantity = Quantity - NEW.Issued_Quantity
   WHERE Equipment_ID = NEW.Equipment_ID
   LIMIT 1;
END $$
DELIMITER ;

INSERT INTO IssueRecord VALUES (1, 1, 120);
