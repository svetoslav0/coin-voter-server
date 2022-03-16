ALTER TABLE `coins`
    DROP COLUMN `category`,
    DROP FOREIGN KEY `FK_coins_categories`;

DROP TABLE `categories`;
