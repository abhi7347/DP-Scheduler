use sdirect;

CREATE TABLE DP_Providers (
    ProviderId INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50),
    Specialty VARCHAR(100),
    PhoneNo VARCHAR(20),
    Email VARCHAR(50) UNIQUE,
    CreatedAt datetime,
	ModifiedAt datetime,
	Gender varchar(10),
	NPI varchar(50)
);

CREATE TABLE DP_Locations (
    LocationId INT PRIMARY KEY IDENTITY(1,1),
    LocationName VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    State VARCHAR(100),
    ZipCode VARCHAR(20),
    PhoneNo VARCHAR(15),
	CreatedAt datetime,
	ModifiedAt datetime,
);

CREATE TABLE DP_Provider_Locations (
    ProviderLocationId INT PRIMARY KEY IDENTITY(1,1),
    ProviderId INT NOT NULL,
    LocationId INT NOT NULL,
    FOREIGN KEY (ProviderId) REFERENCES DP_Providers(ProviderId) ON DELETE CASCADE,
    FOREIGN KEY (LocationId) REFERENCES DP_Locations(LocationId) ON DELETE CASCADE,
	CreatedAt datetime,
	ModifiedAt datetime,
);

CREATE TABLE DP_Availability (
    AvailabilityId INT PRIMARY KEY IDENTITY(1,1),
	  ProviderId int,
    [DayOfWeek] VARCHAR(12) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,	
    FOREIGN KEY (ProviderId) REFERENCES DP_Providers(ProviderId) ON DELETE CASCADE,
	CreatedAt datetime,
	ModifiedAt datetime,
);

CREATE TABLE DP_Patient(
	PatientId INT PRIMARY KEY IDENTITY(1,1),
	[Name] varchar(50),
	Gender varchar(20),
	Age int,
    PhoneNo VARCHAR(20),
	CreatedAt datetime,
	ModifiedAt datetime,
);



CREATE TABLE DP_Appointments(
	AppointmentId INT PRIMARY KEY IDENTITY(1,1),
	ProviderId int,
	PatientId int,
	AppointmentDate datetime,
	StartTime TIME NOT NULL,	
	EndTime TIME NOT NULL,	
	CreatedAt datetime,
	ModifiedAt datetime,
    FOREIGN KEY (ProviderId) REFERENCES DP_Providers(ProviderId) ON DELETE CASCADE,
	FOREIGN KEY (PatientId) REFERENCES DP_Patient(PatientId) ON DELETE CASCADE,
);


INSERT INTO DP_Providers (FirstName, LastName, Specialty, PhoneNo, Email, CreatedAt, ModifiedAt, Gender, NPI)
VALUES 
('John', 'Doe', 'Cardiology', '123-456-7890', 'john.doe@example.com', GETDATE(), GETDATE(), 'Male', '1234567890'),
('Jane', 'Smith', 'Pediatrics', '098-765-4321', 'jane.smith@example.com', GETDATE(), GETDATE(), 'Female', '0987654321'),
('Michael', 'Brown', 'Dermatology', '555-555-5555', 'michael.brown@example.com', GETDATE(), GETDATE(), 'Male', '1122334455'),
('Emily', 'Johnson', 'Orthopedics', '111-222-3333', 'emily.johnson@example.com', GETDATE(), GETDATE(), 'Female', '6677889900'),
('David', 'Lee', 'Neurology', '444-555-6666', 'david.lee@example.com', GETDATE(), GETDATE(), 'Male', '2233445566');
Select * from DP_Providers


INSERT INTO DP_Locations (LocationName, Address, State, ZipCode, PhoneNo, CreatedAt, ModifiedAt)
VALUES
('AIC San Antonio', '123 Main St', 'Texas', '78201', '210-555-1234', GETDATE(), GETDATE()),
('Fortis', '456 Oak Ave', 'California', '90001', '310-555-5678', GETDATE(), GETDATE()),
('City Medical Center', '789 Pine Rd', 'New York', '10001', '212-555-7890', GETDATE(), GETDATE()),
('Mercy Hospital', '101 Maple Dr', 'Illinois', '60601', '312-555-2345', GETDATE(), GETDATE()),
('St. Luke''s', '202 Elm St', 'Florida', '33101', '305-555-3456', GETDATE(), GETDATE());
Select * from DP_Locations


INSERT INTO DP_Provider_Locations (ProviderId, LocationId, CreatedAt, ModifiedAt)
VALUES 
(1, 1, GETDATE(), GETDATE()), 
(2, 2, GETDATE(), GETDATE()), 
(3, 3, GETDATE(), GETDATE()), 
(4, 4, GETDATE(), GETDATE()),
(5, 5, GETDATE(), GETDATE());
Select * from DP_Provider_Locations


INSERT INTO DP_Availability (ProviderId, DayOfWeek, StartTime, EndTime, CreatedAt, ModifiedAt) VALUES
(1, 'Monday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Monday', '13:00', '17:00', GETDATE(), GETDATE()),
(2, 'Tuesday', '09:00', '15:00', GETDATE(), GETDATE()),
(2, 'Wednesday', '10:00', '14:00', GETDATE(), GETDATE()),
(3, 'Thursday', '11:00', '18:00', GETDATE(), GETDATE()),
(3, 'Friday', '08:30', '12:30', GETDATE(), GETDATE()),
(1, 'Saturday', '09:00', '13:00', GETDATE(), GETDATE());
Select * from DP_Availability


INSERT INTO DP_Patient ([Name], Gender, Age, PhoneNo, CreatedAt, ModifiedAt) VALUES
('John Doe', 'Male', 30, '123-456-7890', GETDATE(), GETDATE()),
('Jane Smith', 'Female', 25, '098-765-4321', GETDATE(), GETDATE()),
('Alice Johnson', 'Female', 40, '555-123-4567', GETDATE(), GETDATE()),
('Bob Brown', 'Male', 35, '444-987-6543', GETDATE(), GETDATE()),
('Charlie Davis', 'Male', 50, '333-222-1111', GETDATE(), GETDATE());
Select * from DP_Patient


INSERT INTO DP_Appointments (ProviderId, PatientId, AppointmentDate, StartTime, EndTime, CreatedAt, ModifiedAt) VALUES
(1, 1, '2024-08-15', '09:00', '09:30', GETDATE(), GETDATE()),
(2, 2, '2024-08-16', '10:00', '10:30', GETDATE(), GETDATE()),
(1, 3, '2024-08-17', '11:00', '11:30', GETDATE(), GETDATE()),
(3, 4, '2024-08-18', '14:00', '14:30', GETDATE(), GETDATE()),
(2, 5, '2024-08-19', '15:00', '15:30', GETDATE(), GETDATE());
Select * from DP_Appointments


--------------------- Stored Procedure ---------------------------
CREATE PROCEDURE USP_DayPilot_Procedure
    @DayOfWeek VARCHAR(12),
    @LocationIds VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Declare a table variable to store the split location IDs
    DECLARE @LocationIdTable TABLE (LocationId INT);

    -- Split the comma-separated list of location IDs into table rows
    INSERT INTO @LocationIdTable (LocationId)
    SELECT CAST(value AS INT)  -- Ensure the split values are cast to INT
    FROM STRING_SPLIT(@LocationIds, ',');

    -- Retrieve providers based on the day of the week and location IDs
    -- Ensure that the providers are not busy with another appointment on that day
    SELECT DISTINCT 
        p.ProviderId, 
        p.FirstName, 
        p.LastName, 
        p.Specialty, 
        p.PhoneNo, 
        p.Email
    FROM DP_Providers p
    INNER JOIN DP_Provider_Locations pl ON p.ProviderId = pl.ProviderId
    INNER JOIN DP_Availability a ON p.ProviderId = a.ProviderId
    WHERE a.DayOfWeek = @DayOfWeek
      AND pl.LocationId IN (SELECT LocationId FROM @LocationIdTable)
    ORDER BY p.ProviderId;
END;


 
