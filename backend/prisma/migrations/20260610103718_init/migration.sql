-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ID',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gps_coordinates" TEXT,
    "start_date" DATETIME NOT NULL,
    "estimated_end_date" DATETIME,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "normal_start_hour" TEXT NOT NULL DEFAULT '08:00',
    "normal_end_hour" TEXT NOT NULL DEFAULT '16:00',
    "work_days" TEXT NOT NULL DEFAULT '1,2,3,4,5,6',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tukang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "skill" TEXT,
    "photo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_users_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_tukang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "tukang_id" TEXT NOT NULL,
    "assigned_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "project_tukang_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_tukang_tukang_id_fkey" FOREIGN KEY ("tukang_id") REFERENCES "tukang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tukang_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "mandor_id" TEXT NOT NULL,
    "attendance_date" TEXT NOT NULL,
    "clock_in" DATETIME,
    "clock_out" DATETIME,
    "photo_in_url" TEXT,
    "photo_out_url" TEXT,
    "gps_in" TEXT,
    "gps_out" TEXT,
    "overtime_hours" INTEGER NOT NULL DEFAULT 0,
    "overtime_status" TEXT NOT NULL DEFAULT 'PENDING',
    "overtime_approved_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "attendances_tukang_id_fkey" FOREIGN KEY ("tukang_id") REFERENCES "tukang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_mandor_id_fkey" FOREIGN KEY ("mandor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_overtime_approved_by_fkey" FOREIGN KEY ("overtime_approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "pengawas_id" TEXT NOT NULL,
    "report_date" TEXT NOT NULL,
    "weather" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "progress_percentage" INTEGER NOT NULL,
    "notes" TEXT,
    "material_availability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "daily_reports_pengawas_id_fkey" FOREIGN KEY ("pengawas_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daily_report_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "caption" TEXT,
    "shared_to_consumer" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_manager" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_photos_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "report_photos_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "report_photos_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "mandor_id" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'SEDANG',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "rejection_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "material_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_requests_mandor_id_fkey" FOREIGN KEY ("mandor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_users_project_id_user_id_key" ON "project_users"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_tukang_project_id_tukang_id_key" ON "project_tukang"("project_id", "tukang_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_tukang_id_project_id_attendance_date_key" ON "attendances"("tukang_id", "project_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_project_id_report_date_key" ON "daily_reports"("project_id", "report_date");
