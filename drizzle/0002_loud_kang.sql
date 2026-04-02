CREATE TABLE `deliveryOtps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`riderId` int NOT NULL,
	`customerId` int NOT NULL,
	`otpCode` varchar(10) NOT NULL,
	`isVerified` boolean DEFAULT false,
	`verificationAttempts` int DEFAULT 0,
	`verifiedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryOtps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `razorpayWebhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` varchar(255) NOT NULL,
	`orderId` varchar(50),
	`paymentId` varchar(255) NOT NULL,
	`event` varchar(100) NOT NULL,
	`amount` decimal(10,2),
	`status` varchar(50),
	`processed` boolean DEFAULT false,
	`payload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `razorpayWebhooks_id` PRIMARY KEY(`id`),
	CONSTRAINT `razorpayWebhooks_webhookId_unique` UNIQUE(`webhookId`)
);
--> statement-breakpoint
CREATE TABLE `riderAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`riderId` int,
	`assignmentStatus` enum('pending','notified','accepted','rejected','timeout') DEFAULT 'pending',
	`distance` decimal(8,2),
	`notificationSentAt` timestamp,
	`responseReceivedAt` timestamp,
	`assignmentRound` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderAssignments_id` PRIMARY KEY(`id`)
);
