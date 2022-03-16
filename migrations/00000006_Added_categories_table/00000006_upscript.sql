CREATE TABLE `categories` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO
    `categories`
        (`name`)
VALUES
    ('Games'),
    ('DeFi'),
    ('Gambling'),
    ('Exchanges'),
    ('Collectibles'),
    ('Marketplaces'),
    ('Social'),
    ('High risk'),
    ('Other');

ALTER TABLE `coins`
    ADD COLUMN `category` INT NOT NULL DEFAULT '1' AFTER `contract_address`,
    ADD CONSTRAINT `FK_coins_categories`
        FOREIGN KEY (`category`) REFERENCES `categories` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

