# Add column time_voted
# Change PK to be in new added ID column

ALTER TABLE coin_votes
    DROP FOREIGN KEY `FK_coin_votes_coins`,
    DROP FOREIGN KEY `FK_coin_votes_users`;

ALTER TABLE coin_votes
    DROP PRIMARY KEY,
    ADD COLUMN id INT PRIMARY KEY AUTO_INCREMENT FIRST,
    ADD COLUMN time_voted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD CONSTRAINT `FK_coin_votes_coins` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`),
    ADD CONSTRAINT `FK_coin_votes_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
