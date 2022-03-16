ALTER TABLE coin_votes
    DROP FOREIGN KEY `FK_coin_votes_coins`,
    DROP FOREIGN KEY `FK_coin_votes_users`;

ALTER TABLE coin_votes
    DROP PRIMARY KEY,
    ADD PRIMARY KEY(`coin_id`, `user_id`),
    DROP COLUMN id,
    ADD CONSTRAINT `FK_coin_votes_coins` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`),
    ADD CONSTRAINT `FK_coin_votes_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

