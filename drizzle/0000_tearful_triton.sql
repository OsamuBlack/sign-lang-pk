CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video_urls` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`size` integer NOT NULL,
	`type` text
);
--> statement-breakpoint
CREATE INDEX `video_urls_size_idx` ON `video_urls` (`size`);--> statement-breakpoint
CREATE INDEX `video_urls_type_idx` ON `video_urls` (`type`);--> statement-breakpoint
CREATE TABLE `word_videos` (
	`word_id` integer,
	`video_id` integer,
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
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`url` text NOT NULL,
	`image_url` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `words_word_idx` ON `words` (`word`);--> statement-breakpoint
CREATE INDEX `words_category_id_idx` ON `words` (`category_id`);--> statement-breakpoint
CREATE INDEX `words_is_alphabet_idx` ON `words` (`is_alphabet`);