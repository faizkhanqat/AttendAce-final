CREATE TABLE "users" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(100) NOT NULL,
  "email" varchar(100) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" enum('student','teacher') NOT NULL,
  "gender" enum('male','female') DEFAULT NULL,
  "dob" date DEFAULT NULL,
  "department" varchar(100) DEFAULT NULL,
  "mode" enum('official','gaming') NOT NULL,
  "aviation_id" varchar(20) DEFAULT NULL,
  "otp_code" varchar(10) DEFAULT NULL,
  "otp_expires" datetime DEFAULT NULL,
  "reg_otp_code" varchar(10) DEFAULT NULL,
  "reg_otp_expires" datetime DEFAULT NULL,
  "is_verified" tinyint(1) DEFAULT '0',
  "face_encoding" text,
  "created_at" datetime DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "last_login" datetime DEFAULT NULL,
  "phone" varchar(20) DEFAULT NULL,
  "face_updated_at" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "email" ("email"),
  UNIQUE KEY "aviation_id" ("aviation_id")
)

CREATE TABLE "active_classes" (
  "id" int NOT NULL AUTO_INCREMENT,
  "class_id" int NOT NULL,
  "teacher_id" int NOT NULL,
  "expires_at" datetime NOT NULL,
  "conducted_on" date DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_active_class" ("class_id"),
  KEY "teacher_id" ("teacher_id"),
  KEY "idx_active_class" ("class_id","expires_at"),
  CONSTRAINT "active_classes_ibfk_1" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE CASCADE,
  CONSTRAINT "active_classes_ibfk_2" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE CASCADE
)


CREATE TABLE "attendance" (
  "id" int NOT NULL AUTO_INCREMENT,
  "student_id" int NOT NULL,
  "class_id" int NOT NULL,
  "conducted_on" date NOT NULL,
  "qr_token" varchar(255) DEFAULT NULL,
  "face_match" tinyint(1) DEFAULT '0',
  "status" enum('present','absent','pending') DEFAULT 'pending',
  "method" enum('qr','manual','gps','face') DEFAULT 'qr',
  "timestamp" datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_student_session" ("student_id","class_id","conducted_on"),
  KEY "idx_attendance_class_date" ("class_id","timestamp"),
  KEY "idx_student_class" ("student_id","class_id"),
  CONSTRAINT "attendance_ibfk_1" FOREIGN KEY ("student_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "attendance_ibfk_2" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE CASCADE
)


CREATE TABLE "attendance_logs" (
  "id" int NOT NULL AUTO_INCREMENT,
  "student_id" int NOT NULL,
  "action" varchar(100) NOT NULL,
  "details" text,
  "created_at" datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "student_id" ("student_id"),
  CONSTRAINT "attendance_logs_ibfk_1" FOREIGN KEY ("student_id") REFERENCES "users" ("id") ON DELETE CASCADE
)


CREATE TABLE "class_sessions" (
  "id" int NOT NULL AUTO_INCREMENT,
  "class_id" int NOT NULL,
  "activated_on" date NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_class_day" ("class_id","activated_on")
)



CREATE TABLE "classes" (
  "id" int NOT NULL AUTO_INCREMENT,
  "teacher_id" int NOT NULL,
  "name" varchar(100) NOT NULL,
  "subject" varchar(255) DEFAULT '',
  "total_classes" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "teacher_id" ("teacher_id"),
  CONSTRAINT "classes_ibfk_1" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE CASCADE
)


CREATE TABLE "qr_tokens" (
  "id" int NOT NULL AUTO_INCREMENT,
  "class_id" int NOT NULL,
  "teacher_id" int NOT NULL,
  "token" varchar(255) NOT NULL,
  "created_at" datetime DEFAULT CURRENT_TIMESTAMP,
  "expires_at" datetime DEFAULT NULL,
  "used_count" int DEFAULT '0',
  "status" enum('active','expired') DEFAULT 'active',
  PRIMARY KEY ("id"),
  KEY "class_id" ("class_id"),
  KEY "teacher_id" ("teacher_id"),
  KEY "idx_qr_token" ("token"),
  CONSTRAINT "qr_tokens_ibfk_1" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE CASCADE,
  CONSTRAINT "qr_tokens_ibfk_2" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE CASCADE
)



CREATE TABLE "student_classes" (
  "id" int NOT NULL AUTO_INCREMENT,
  "student_id" int NOT NULL,
  "class_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_enrollment" ("student_id","class_id"),
  KEY "class_id" ("class_id"),
  CONSTRAINT "student_classes_ibfk_1" FOREIGN KEY ("student_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "student_classes_ibfk_2" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE CASCADE
)

