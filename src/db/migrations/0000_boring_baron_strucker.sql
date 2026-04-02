CREATE TABLE `accounts` (
	`user_id` varchar(36) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` text,
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `accounts_provider_unique_idx` UNIQUE(`provider`,`provider_account_id`)
);
--> statement-breakpoint
CREATE TABLE `habit_logs` (
	`id` varchar(36) NOT NULL,
	`habit_id` varchar(36) NOT NULL,
	`date` varchar(30) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(500) NOT NULL,
	`type` enum('exercise','work','fun','other') NOT NULL DEFAULT 'other',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_streaks` (
	`user_id` varchar(36) NOT NULL,
	`current_streak` int NOT NULL DEFAULT 0,
	`longest_streak` int NOT NULL DEFAULT 0,
	`last_login_date` varchar(30),
	`points_awarded_today` int NOT NULL DEFAULT 0,
	CONSTRAINT `login_streaks_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `moods` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`mood` varchar(50) NOT NULL,
	`stress_source` text,
	`sleep_quality` varchar(50),
	`advice` text,
	`date` varchar(30) NOT NULL,
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`diet_type` varchar(50) NOT NULL,
	`activity_level` varchar(50) NOT NULL,
	`advice` text,
	`date` varchar(30) NOT NULL,
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutrition_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_history` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_targets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`purpose` varchar(500) NOT NULL,
	`target_amount` double NOT NULL,
	`current_amount` double NOT NULL DEFAULT 0,
	`due_date` varchar(30),
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savings_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_transactions` (
	`id` varchar(36) NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`amount` double NOT NULL,
	`date` varchar(30) NOT NULL,
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savings_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `sessions_session_token` PRIMARY KEY(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `sleep_analyses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`sleep_start` varchar(10) NOT NULL,
	`sleep_end` varchar(10) NOT NULL,
	`analysis` text,
	`date` varchar(30) NOT NULL,
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`due_date` varchar(30),
	`status` enum('pending','done','cancelled') NOT NULL DEFAULT 'pending',
	`points_awarded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `todos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`badge_id` varchar(100) NOT NULL,
	`claimed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` timestamp,
	`name` varchar(255),
	`password_hash` text,
	`image` text,
	`status` varchar(255),
	`locale` varchar(10) NOT NULL DEFAULT 'en',
	`theme` varchar(20) NOT NULL DEFAULT 'dark',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verification_tokens_identifier_token_unique_idx` UNIQUE(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `habit_logs` ADD CONSTRAINT `habit_logs_habit_id_habits_id_fk` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `habits` ADD CONSTRAINT `habits_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `login_streaks` ADD CONSTRAINT `login_streaks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moods` ADD CONSTRAINT `moods_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nutrition_logs` ADD CONSTRAINT `nutrition_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `points_history` ADD CONSTRAINT `points_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `savings_targets` ADD CONSTRAINT `savings_targets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `savings_transactions` ADD CONSTRAINT `savings_transactions_target_id_savings_targets_id_fk` FOREIGN KEY (`target_id`) REFERENCES `savings_targets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sleep_analyses` ADD CONSTRAINT `sleep_analyses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todos` ADD CONSTRAINT `todos_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;