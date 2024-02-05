-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "houses" (
    "id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "pet" BOOLEAN,
    "smoke" BOOLEAN,
    "alcohol" BOOLEAN,
    "food" BOOLEAN,
    "airConditioning" BOOLEAN,
    "internet" TEXT,
    "peopleCount" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "rentCost" INTEGER NOT NULL,
    "totalFloor" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "address" TEXT,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT,
    "jwt_token" TEXT,
    "username" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT NOT NULL DEFAULT 'none',
    "houseData" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileData" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "name" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "igUsername" TEXT,
    "profilePhotoUrl" TEXT,
    "university" TEXT,
    "faculty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "houses_id_key" ON "houses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "houses_userId_key" ON "houses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_key" ON "Message"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_from_key" ON "Message"("from");

-- CreateIndex
CREATE UNIQUE INDEX "Message_to_key" ON "Message"("to");

-- AddForeignKey
ALTER TABLE "houses" ADD CONSTRAINT "houses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_from_fkey" FOREIGN KEY ("from") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
