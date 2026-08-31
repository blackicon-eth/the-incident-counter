CREATE TABLE `counter_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_incident_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL
);
