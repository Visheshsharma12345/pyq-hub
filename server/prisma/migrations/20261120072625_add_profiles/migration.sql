-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "employee_id" TEXT,
    "roll_number" TEXT,
    "semester" INTEGER,
    "batch" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "website_url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
