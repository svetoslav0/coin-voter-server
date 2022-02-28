ALTER TABLE `users`
DROP FOREIGN KEY `FK_users_users_login_types`;

ALTER TABLE users
DROP COLUMN login_type_id;

DROP TABLE users_login_types;
