ALTER TABLE `categories` ADD `slug` text;--> statement-breakpoint
CREATE INDEX `categories_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_slug_key` ON `categories` (`name`,`slug`);--> statement-breakpoint
ALTER TABLE `words` ADD `slug` text;--> statement-breakpoint
CREATE INDEX `words_slug_idx` ON `words` (`slug`);
