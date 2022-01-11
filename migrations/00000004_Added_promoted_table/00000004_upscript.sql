CREATE TABLE promoted_coins (
    coin_id int NOT NULL PRIMARY KEY,
    date_promoted DATETIME NOT NULL
);

ALTER TABLE `promoted_coins`
ADD CONSTRAINT `FK_promoted_coins_coins`
FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;
