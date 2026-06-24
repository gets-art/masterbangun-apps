-- AlterTable
ALTER TABLE "project_tukang" ADD COLUMN "contract_desc" TEXT;
ALTER TABLE "project_tukang" ADD COLUMN "contract_value" REAL;
ALTER TABLE "project_tukang" ADD COLUMN "progress_percent" INTEGER;

-- CreateTable
CREATE TABLE "photo_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daily_report_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photo_sessions_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'LAINNYA',
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "shared_to_consumer" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_documents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "project_documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "document_comments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "project_documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_report_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daily_report_id" TEXT NOT NULL,
    "photo_session_id" TEXT,
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
    CONSTRAINT "report_photos_photo_session_id_fkey" FOREIGN KEY ("photo_session_id") REFERENCES "photo_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "report_photos_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "report_photos_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_report_photos" ("approved_at", "approved_by", "approved_by_manager", "caption", "created_at", "daily_report_id", "deleted_at", "deleted_by", "id", "is_deleted", "photo_url", "shared_to_consumer") SELECT "approved_at", "approved_by", "approved_by_manager", "caption", "created_at", "daily_report_id", "deleted_at", "deleted_by", "id", "is_deleted", "photo_url", "shared_to_consumer" FROM "report_photos";
DROP TABLE "report_photos";
ALTER TABLE "new_report_photos" RENAME TO "report_photos";
CREATE TABLE "new_tukang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "skill" TEXT,
    "type" TEXT NOT NULL DEFAULT 'HARIAN',
    "daily_rate" REAL,
    "contract_value" REAL,
    "contract_desc" TEXT,
    "photo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_tukang" ("created_at", "id", "is_active", "name", "phone", "photo_url", "skill", "updated_at") SELECT "created_at", "id", "is_active", "name", "phone", "photo_url", "skill", "updated_at" FROM "tukang";
DROP TABLE "tukang";
ALTER TABLE "new_tukang" RENAME TO "tukang";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
