-- CreateTable
CREATE TABLE "Access" (
    "alias" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granteeUserId" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY,
    "permissions" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Access_granteeUserId_fkey" FOREIGN KEY ("granteeUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "balance" REAL NOT NULL DEFAULT 0,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT,
    "id" TEXT NOT NULL,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "platformId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id", "userId"),
    CONSTRAINT "Account_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "accountId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "AccountBalance_accountId_userId_fkey" FOREIGN KEY ("accountId", "userId") REFERENCES "Account" ("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analytics" (
    "activityCount" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "dataProviderGhostfolioDailyRequests" INTEGER NOT NULL DEFAULT 0,
    "lastRequestAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashedKey" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SymbolProfileOverrides" (
    "assetClass" TEXT,
    "assetSubClass" TEXT,
    "countries" JSONB,
    "holdings" JSONB,
    "name" TEXT,
    "sectors" JSONB,
    "symbolProfileId" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "url" TEXT,
    CONSTRAINT "SymbolProfileOverrides_symbolProfileId_fkey" FOREIGN KEY ("symbolProfileId") REFERENCES "SymbolProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetProfileResolution" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,
    "dataSourceOrigin" TEXT NOT NULL,
    "dataSourceTarget" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "symbolOrigin" TEXT NOT NULL,
    "symbolTarget" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuthDevice" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credentialId" BLOB NOT NULL,
    "credentialPublicKey" BLOB NOT NULL,
    "counter" INTEGER NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketData" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSource" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketPrice" REAL NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CLOSE',
    "symbol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "accountId" TEXT,
    "accountUserId" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT,
    "date" DATETIME NOT NULL,
    "fee" REAL NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "quantity" REAL NOT NULL,
    "symbolProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Order_accountId_accountUserId_fkey" FOREIGN KEY ("accountId", "accountUserId") REFERENCES "Account" ("id", "userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_symbolProfileId_fkey" FOREIGN KEY ("symbolProfileId") REFERENCES "SymbolProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Property" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "settings" JSONB,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SymbolProfile" (
    "assetClass" TEXT,
    "assetSubClass" TEXT,
    "comment" TEXT,
    "countries" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,
    "cusip" TEXT,
    "dataGatheringFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "dataSource" TEXT NOT NULL,
    "figi" TEXT,
    "figiComposite" TEXT,
    "figiShareClass" TEXT,
    "holdings" JSONB,
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isin" TEXT,
    "name" TEXT,
    "scraperConfiguration" JSONB,
    "sectors" JSONB,
    "symbol" TEXT NOT NULL,
    "symbolMapping" JSONB,
    "updatedAt" DATETIME NOT NULL,
    "url" TEXT,
    "userId" TEXT,
    CONSTRAINT "SymbolProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "price" REAL,
    "stripeCheckoutSessionId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagsOnAccounts" (
    "accountId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tagId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("accountId", "tagId", "userId"),
    CONSTRAINT "TagsOnAccounts_accountId_userId_fkey" FOREIGN KEY ("accountId", "userId") REFERENCES "Account" ("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagsOnAccounts_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "accessToken" TEXT,
    "authChallenge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'ANONYMOUS',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "thirdPartyId" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_OrderToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_OrderToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OrderToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserWatchlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserWatchlist_A_fkey" FOREIGN KEY ("A") REFERENCES "SymbolProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserWatchlist_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Access_alias_idx" ON "Access"("alias");

-- CreateIndex
CREATE INDEX "Access_granteeUserId_idx" ON "Access"("granteeUserId");

-- CreateIndex
CREATE INDEX "Access_userId_idx" ON "Access"("userId");

-- CreateIndex
CREATE INDEX "Account_currency_idx" ON "Account"("currency");

-- CreateIndex
CREATE INDEX "Account_id_idx" ON "Account"("id");

-- CreateIndex
CREATE INDEX "Account_isExcluded_idx" ON "Account"("isExcluded");

-- CreateIndex
CREATE INDEX "Account_name_idx" ON "Account"("name");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "AccountBalance_accountId_idx" ON "AccountBalance"("accountId");

-- CreateIndex
CREATE INDEX "AccountBalance_date_idx" ON "AccountBalance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountId_date_key" ON "AccountBalance"("accountId", "date");

-- CreateIndex
CREATE INDEX "Analytics_lastRequestAt_idx" ON "Analytics"("lastRequestAt");

-- CreateIndex
CREATE INDEX "Analytics_updatedAt_idx" ON "Analytics"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetProfileResolution_dataSourceOrigin_symbolOrigin_key" ON "AssetProfileResolution"("dataSourceOrigin", "symbolOrigin");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_idx" ON "AuthDevice"("userId");

-- CreateIndex
CREATE INDEX "MarketData_dataSource_idx" ON "MarketData"("dataSource");

-- CreateIndex
CREATE INDEX "MarketData_dataSource_symbol_idx" ON "MarketData"("dataSource", "symbol");

-- CreateIndex
CREATE INDEX "MarketData_date_idx" ON "MarketData"("date");

-- CreateIndex
CREATE INDEX "MarketData_marketPrice_idx" ON "MarketData"("marketPrice");

-- CreateIndex
CREATE INDEX "MarketData_state_idx" ON "MarketData"("state");

-- CreateIndex
CREATE INDEX "MarketData_symbol_idx" ON "MarketData"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_dataSource_date_symbol_key" ON "MarketData"("dataSource", "date", "symbol");

-- CreateIndex
CREATE INDEX "Order_accountId_idx" ON "Order"("accountId");

-- CreateIndex
CREATE INDEX "Order_date_idx" ON "Order"("date");

-- CreateIndex
CREATE INDEX "Order_isDraft_idx" ON "Order"("isDraft");

-- CreateIndex
CREATE INDEX "Order_type_idx" ON "Order"("type");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_url_key" ON "Platform"("url");

-- CreateIndex
CREATE INDEX "Platform_name_idx" ON "Platform"("name");

-- CreateIndex
CREATE INDEX "SymbolProfile_assetClass_idx" ON "SymbolProfile"("assetClass");

-- CreateIndex
CREATE INDEX "SymbolProfile_currency_idx" ON "SymbolProfile"("currency");

-- CreateIndex
CREATE INDEX "SymbolProfile_cusip_idx" ON "SymbolProfile"("cusip");

-- CreateIndex
CREATE INDEX "SymbolProfile_dataGatheringFrequency_idx" ON "SymbolProfile"("dataGatheringFrequency");

-- CreateIndex
CREATE INDEX "SymbolProfile_dataSource_idx" ON "SymbolProfile"("dataSource");

-- CreateIndex
CREATE INDEX "SymbolProfile_isActive_idx" ON "SymbolProfile"("isActive");

-- CreateIndex
CREATE INDEX "SymbolProfile_isin_idx" ON "SymbolProfile"("isin");

-- CreateIndex
CREATE INDEX "SymbolProfile_name_idx" ON "SymbolProfile"("name");

-- CreateIndex
CREATE INDEX "SymbolProfile_symbol_idx" ON "SymbolProfile"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "SymbolProfile_dataSource_symbol_key" ON "SymbolProfile"("dataSource", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCheckoutSessionId_key" ON "Subscription"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId");

-- CreateIndex
CREATE INDEX "TagsOnAccounts_tagId_idx" ON "TagsOnAccounts"("tagId");

-- CreateIndex
CREATE INDEX "User_accessToken_idx" ON "User"("accessToken");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_provider_idx" ON "User"("provider");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_thirdPartyId_idx" ON "User"("thirdPartyId");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToTag_AB_unique" ON "_OrderToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToTag_B_index" ON "_OrderToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserWatchlist_AB_unique" ON "_UserWatchlist"("A", "B");

-- CreateIndex
CREATE INDEX "_UserWatchlist_B_index" ON "_UserWatchlist"("B");
