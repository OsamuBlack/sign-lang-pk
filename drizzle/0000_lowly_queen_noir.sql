CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video_urls` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`size` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `word_videos` (
	`word_id` integer NOT NULL,
	`video_id` integer NOT NULL,
	PRIMARY KEY(`word_id`, `video_id`),
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `video_urls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY NOT NULL,
	`word` text NOT NULL,
	`is_alphabet` integer DEFAULT false,
	`definition` text NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-06-26T05:24:45.856Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-06-26T05:24:45.856Z"' NOT NULL,
	`url` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
