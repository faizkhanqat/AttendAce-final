-- Add GPS Geofencing Columns to active_classes table
ALTER TABLE active_classes 
ADD COLUMN teacher_lat DECIMAL(10,8) NULL,
ADD COLUMN teacher_lng DECIMAL(10,8) NULL;
