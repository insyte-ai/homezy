import { User } from "../models/User.model";
import { logger } from "../utils/logger";

interface AdminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const adminUsers: AdminData[] = [
  {
    email: "admin@homezy.co",
    password: "Homezy@Admin2025",
    firstName: "Super",
    lastName: "Admin",
    phone: "+971501234567",
  },
];

export const seedAdmins = async (): Promise<{
  created: number;
  skipped: number;
}> => {
  try {
    logger.info("🌱 Starting admin seeder...");

    // Check if admins already exist
    const existingAdmins = await User.find({ role: "admin" });

    if (
      existingAdmins.length > 0 &&
      process.env.SKIP_EXISTING_ADMINS !== "false"
    ) {
      logger.info(
        `✅ ${existingAdmins.length} admin(s) already exist. Skipping seeding.`
      );
      logger.info("💡 Set SKIP_EXISTING_ADMINS=false to recreate admin users");
      return { created: 0, skipped: existingAdmins.length };
    }

    // If SKIP_EXISTING_ADMINS is false, delete existing admins
    if (
      existingAdmins.length > 0 &&
      process.env.SKIP_EXISTING_ADMINS === "false"
    ) {
      logger.info("🗑️  Deleting existing admin users...");
      await User.deleteMany({ role: "admin" });
      logger.info(`✅ Deleted ${existingAdmins.length} existing admin(s)`);
    }

    // Create admin users
    const createdAdmins = [];
    for (const adminData of adminUsers) {
      const admin = new User({
        email: adminData.email,
        password: adminData.password,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phone: adminData.phone,
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
        hasSetPassword: true,
        isGuestAccount: false,
      });

      const savedAdmin = await admin.save();
      createdAdmins.push(savedAdmin);
      logger.info(
        `✅ Created admin user: ${savedAdmin.email} (ID: ${savedAdmin._id})`
      );
    }

    logger.info("\n📋 Admin Credentials Summary:");
    logger.info("━".repeat(50));
    adminUsers.forEach((admin) => {
      logger.info(`Email: ${admin.email}`);
      logger.info(`Password: ${admin.password}`);
      logger.info("━".repeat(50));
    });
    logger.warn("⚠️  Remember to change default passwords in production!");

    return { created: createdAdmins.length, skipped: 0 };
  } catch (error: any) {
    logger.error("❌ Error seeding admins:", error);
    throw error;
  }
};

// Allow running this seeder standalone
if (require.main === module) {
  const path = require("path");
  const dotenv = require("dotenv");

  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });

  const { connectDatabase, disconnectDatabase } = require("../config/database");

  (async () => {
    try {
      await connectDatabase();
      const result = await seedAdmins();
      logger.info(
        `\n✅ Admin seeder completed: ${result.created} created, ${result.skipped} skipped`
      );
      await disconnectDatabase();
      process.exit(0);
    } catch (error) {
      logger.error("❌ Admin seeder failed:", error);
      process.exit(1);
    }
  })();
}
