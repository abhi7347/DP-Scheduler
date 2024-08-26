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
select * from DP_Provider_Locations
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
  EventId varchar(150) ,
  EventName varchar(100),
	AppointmentDate Date,
	StartTime DATETIME NOT NULL,	
	EndTime DATETIME NOT NULL,
  Color varchar(50),
	CreatedAt datetime,
	ModifiedAt datetime,
    FOREIGN KEY (ProviderId) REFERENCES DP_Providers(ProviderId) ON DELETE CASCADE,
);
drop table DP_Appointments

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
-- Providers assigned to Location 1
(1, 1, GETDATE(), GETDATE()), 
(2, 1, GETDATE(), GETDATE()), 
(5, 1, GETDATE(), GETDATE()),

-- Providers assigned to Location 2
(3, 2, GETDATE(), GETDATE()), 
(1, 2, GETDATE(), GETDATE()), 
(5, 2, GETDATE(), GETDATE()),

-- Providers assigned to Location 3
(2, 3, GETDATE(), GETDATE()), 
(4, 3, GETDATE(), GETDATE()), 
(3, 3, GETDATE(), GETDATE()),

-- Providers assigned to Location 4
(4, 4, GETDATE(), GETDATE()), 
(5, 4, GETDATE(), GETDATE()), 
(2, 4, GETDATE(), GETDATE()),

-- Providers assigned to Location 5
(3, 5, GETDATE(), GETDATE()), 
(4, 5, GETDATE(), GETDATE()), 
(5, 5, GETDATE(), GETDATE());



INSERT INTO DP_Availability (ProviderId, DayOfWeek, StartTime, EndTime, CreatedAt, ModifiedAt) VALUES
-- Provider 1
(1, 'Monday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Monday', '03:00', '06:00', GETDATE(), GETDATE()),
(1, 'Tuesday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Wednesday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Thursday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Friday', '08:00', '12:00', GETDATE(), GETDATE()),
(1, 'Saturday', '09:00', '13:00', GETDATE(), GETDATE()),

-- Provider 2
(2, 'Monday', '09:00', '15:00', GETDATE(), GETDATE()), 
(2, 'Tuesday', '09:00', '15:00', GETDATE(), GETDATE()),
(2, 'Wednesday', '10:00', '14:00', GETDATE(), GETDATE()),
(2, 'Thursday', '10:00', '14:00', GETDATE(), GETDATE()),
(2, 'Friday', '09:00', '15:00', GETDATE(), GETDATE()),

-- Provider 3
(3, 'Monday', '10:00', '14:00', GETDATE(), GETDATE()),
(3, 'Tuesday', '11:00', '18:00', GETDATE(), GETDATE()), 
(3, 'Wednesday', '11:00', '18:00', GETDATE(), GETDATE()),
(3, 'Thursday', '11:00', '18:00', GETDATE(), GETDATE()),
(3, 'Friday', '08:30', '12:30', GETDATE(), GETDATE()),

-- Provider 4
(4, 'Monday', '08:00', '12:00', GETDATE(), GETDATE()),
(4, 'Wednesday', '09:00', '13:00', GETDATE(), GETDATE()),
(4, 'Thursday', '08:00', '12:00', GETDATE(), GETDATE()),
(4, 'Saturday', '10:00', '14:00', GETDATE(), GETDATE()),

-- Provider 5
(5, 'Tuesday', '10:00', '14:00', GETDATE(), GETDATE()),
(5, 'Thursday', '10:00', '14:00', GETDATE(), GETDATE()), 
(5, 'Friday', '11:30', '15:30', GETDATE(), GETDATE()),
(5, 'Saturday', '10:00', '14:00', GETDATE(), GETDATE());


Select * from DP_Availability
delete from DP_Availability;


INSERT INTO DP_Patient ([Name], Gender, Age, PhoneNo, CreatedAt, ModifiedAt) VALUES
('John Doe', 'Male', 30, '123-456-7890', GETDATE(), GETDATE()),
('Jane Smith', 'Female', 25, '098-765-4321', GETDATE(), GETDATE()),
('Alice Johnson', 'Female', 40, '555-123-4567', GETDATE(), GETDATE()),
('Bob Brown', 'Male', 35, '444-987-6543', GETDATE(), GETDATE()),
('Charlie Davis', 'Male', 50, '333-222-1111', GETDATE(), GETDATE());
Select * from DP_Patient


INSERT INTO DP_Appointments (ProviderId, PatientId, EventDate, StartTime, EndTime, CreatedAt, ModifiedAt) VALUES
delete from DP_Appointments where EventName = 'Event 1';
Select * from DP_Appointments;

--------------------- Stored Procedure ---------------------------
EXEC USP_DayPilot_Procedure @DayOfWeek='Thursday',@LocationIds='1'

ALTER PROCEDURE USP_DayPilot_Procedure
    @DayOfWeek VARCHAR(12) null,
    @LocationIds VARCHAR(MAX) null
AS
BEGIN
    SET NOCOUNT ON;

    -- Declare a table variable to store the split location IDs
    DECLARE @LocationIdTable TABLE (LocationId INT);

    -- Split the comma-separated list of location IDs into table rows
    INSERT INTO @LocationIdTable (LocationId)
    SELECT CAST(value AS INT)
    FROM STRING_SPLIT(@LocationIds, ',');

    -- Retrieve providers based on the day of the week and location IDs
    SELECT DISTINCT 
        p.ProviderId,
        p.FirstName, 
        p.LastName, 
        p.Specialty, 
        p.PhoneNo, 
        p.Email,
        a.StartTime,       
        a.EndTime
    FROM DP_Providers p
    INNER JOIN DP_Provider_Locations pl ON p.ProviderId = pl.ProviderId
    INNER JOIN DP_Availability a ON p.ProviderId = a.ProviderId
    WHERE a.DayOfWeek = @DayOfWeek
      AND pl.LocationId IN (SELECT LocationId FROM @LocationIdTable)
    ORDER BY p.ProviderId;    
END;



    ------- Getting the Booked Appointments ------------
EXEC USP_GetBookedAppointments @selectedDate='2024-08-26', @LocationIds='1';

ALTER PROCEDURE USP_GetBookedAppointments
    @selectedDate DATE NULL,       -- Parameter for the specific date
    @LocationIds VARCHAR(MAX) NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Declare a table variable to store the split location IDs
    DECLARE @LocationIdTable TABLE (LocationId INT);

    -- Split the comma-separated list of location IDs into table rows
    INSERT INTO @LocationIdTable (LocationId)
    SELECT CAST(value AS INT)
    FROM STRING_SPLIT(@LocationIds, ',');

    -- Retrieve booked appointments based on the modified date, location, and providers
    SELECT DISTINCT 
        appt.ProviderId,
        appt.StartTime AS AppointmentStartTime,
        appt.EndTime AS AppointmentEndTime,
        appt.AppointmentDate,
        appt.EventName As AppointmentName,
        p.FirstName,
        p.LastName
    FROM DP_Appointments appt
    INNER JOIN DP_Providers p ON appt.ProviderId = p.ProviderId
    INNER JOIN DP_Provider_Locations pl ON p.ProviderId = pl.ProviderId
    WHERE CAST(appt.AppointmentDate AS DATE) = @selectedDate
      AND pl.LocationId IN (SELECT LocationId FROM @LocationIdTable)
      AND ISNULL(appt.IsDeleted, 0) = 0
    ORDER BY appt.ProviderId, appt.StartTime;
END;

