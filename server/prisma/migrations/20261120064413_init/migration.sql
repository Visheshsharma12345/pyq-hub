-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'faculty', 'admin');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('notes', 'pyq');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "semester" INTEGER NOT NULL,
    "subject_code" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "unit" INTEGER,
    "exam_year" INTEGER,
    "file_url" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "upvotes_count" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upvotes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "upvotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "resources_file_hash_key" ON "resources"("file_hash");

-- CreateIndex
CREATE UNIQUE INDEX "upvotes_user_id_resource_id_key" ON "upvotes"("user_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_resource_id_key" ON "bookmarks"("user_id", "resource_id");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
