CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`commissionPercentage` decimal(5,2) NOT NULL,
	`commissionAmount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menuItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(100),
	`image` text,
	`isVegetarian` boolean DEFAULT false,
	`isAvailable` boolean DEFAULT true,
	`preparationTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`riderId` int NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`status` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`riderId` int,
	`totalAmount` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0',
	`deliveryFee` decimal(10,2) DEFAULT '0',
	`discountAmount` decimal(10,2) DEFAULT '0',
	`status` enum('pending','confirmed','preparing','ready','picked_up','on_the_way','delivered','cancelled') DEFAULT 'pending',
	`paymentMethod` enum('upi','razorpay','cod') NOT NULL,
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`deliveryAddress` text NOT NULL,
	`deliveryLatitude` double,
	`deliveryLongitude` double,
	`specialInstructions` text,
	`estimatedDeliveryTime` timestamp,
	`actualDeliveryTime` timestamp,
	`items` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `otps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`code` varchar(10) NOT NULL,
	`isVerified` boolean DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`customerId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('upi','razorpay','cod') NOT NULL,
	`transactionId` varchar(255),
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userType` enum('restaurant','rider') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`bankAccount` varchar(255) NOT NULL,
	`ifscCode` varchar(20) NOT NULL,
	`transactionId` varchar(255),
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`customerId` int NOT NULL,
	`restaurantId` int,
	`riderId` int,
	`rating` int NOT NULL,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cuisineType` varchar(100),
	`address` text NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`image` text,
	`rating` decimal(3,2) DEFAULT '4.5',
	`isActive` boolean DEFAULT true,
	`commissionPercentage` decimal(5,2) DEFAULT '15',
	`bankAccount` varchar(255),
	`ifscCode` varchar(20),
	`totalEarnings` decimal(15,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`vehicleType` enum('bike','scooter','car') DEFAULT 'bike',
	`vehicleNumber` varchar(50),
	`licenseNumber` varchar(50),
	`isActive` boolean DEFAULT false,
	`currentLatitude` double,
	`currentLongitude` double,
	`totalDeliveries` int DEFAULT 0,
	`totalEarnings` decimal(15,2) DEFAULT '0',
	`rating` decimal(3,2) DEFAULT '4.5',
	`bankAccount` varchar(255),
	`ifscCode` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('customer','restaurant','rider','admin','user') NOT NULL DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImage` text;