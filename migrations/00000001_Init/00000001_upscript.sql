CREATE DATABASE IF NOT EXISTS `coiner_bck`;
USE `coiner_bck`;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `FK_users_user_roles` (`role_id`),
  CONSTRAINT `FK_users_user_roles` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `coins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `symbol` varchar(50) NOT NULL,
  `launch_date` datetime DEFAULT NULL,
  `owner` int NOT NULL,
  `is_approved` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `symbol` (`symbol`),
  KEY `FK_coins_users` (`owner`),
  CONSTRAINT `FK_coins_users` FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `coin_votes` (
  `user_id` int NOT NULL,
  `coin_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`coin_id`),
  KEY `FK_coin_votes_coins` (`coin_id`),
  CONSTRAINT `FK_coin_votes_coins` FOREIGN KEY (`coin_id`) REFERENCES `coins` (`id`),
  CONSTRAINT `FK_coin_votes_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `user_roles` (`id`, `name`) VALUES
	(2, 'admin'),
	(1, 'user');

INSERT INTO `users` (`id`, `username`, `password`, `role_id`) VALUES
	(1, 'admin', '$2a$10$HT8IEWALhfReks3IAUOv4.4gosafKNW.48I3hple4jRuh.ZQzHOja', 2),
	(2, 'pesho', '$2a$10$MISUCcGNQX5dZNln/oLbX.zQnNuePkBIMoF.tKuOXRdp1scTQHzQe', 1);


