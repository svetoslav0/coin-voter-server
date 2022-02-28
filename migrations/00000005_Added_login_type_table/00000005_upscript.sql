CREATE TABLE users_login_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login_type VARCHAR(64) NOT NULL
);

INSERT INTO users_login_types (login_type)
VALUES ("DEFAULT"),
       ("GOOLGE"),
       ("TWITTER");

ALTER TABLE users
ADD login_type_id INT DEFAULT 1;

ALTER TABLE `users`
ADD CONSTRAINT `FK_users_users_login_types`
FOREIGN KEY (`login_type_id`) REFERENCES `users_login_types` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;
