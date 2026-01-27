// src/common/seeders/initial-seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Estate } from 'src/estates/entities/estate.entity';


@Injectable()
export class InitialSeedService {
  private readonly logger = new Logger(InitialSeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Estate.name) private estateModel: Model<Estate>,
  ) {}

  async seed() {
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      this.logger.log('Database already seeded');
      return;
    }

    this.logger.log('Seeding database...');

    // Create super admin user first to be the estate owner
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await this.userModel.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '1234567890',
      primaryRole: UserRole.SUPER_ADMIN,
    });

    // Create default estate
    const estate = await this.estateModel.create({
      owner: superAdmin._id,
      name: 'Sample Estate',
      location: {
        address: '123 Sample Street',
        city: 'Sample City',
        state: 'Sample State',
        country: 'Sample Country',
      },
      zipCode: '12345',
      description: 'A sample estate for demonstration purposes',
    });

    // Create estate admin user
    const estateAdminPassword = await bcrypt.hash('estateadmin123', 10);
    await this.userModel.create({
      firstName: 'Estate',
      lastName: 'Admin',
      email: 'estateadmin@example.com',
      password: estateAdminPassword,
      phone: '1234567891',
      primaryRole: UserRole.ADMIN,
      estate: estate._id,
    });

    // Create landlord user
    const landlordPassword = await bcrypt.hash('landlord123', 10);
    await this.userModel.create({
      firstName: 'Landlord',
      lastName: 'User',
      email: 'landlord@example.com',
      password: landlordPassword,
      phone: '1234567892',
      primaryRole: UserRole.LANDLORD,
      estate: estate._id,
    });

    // Create tenant user
    const tenantPassword = await bcrypt.hash('tenant123', 10);
    await this.userModel.create({
      firstName: 'Tenant',
      lastName: 'User',
      email: 'tenant@example.com',
      password: tenantPassword,
      phone: '1234567893',
      primaryRole: UserRole.TENANT,
      estate: estate._id,
    });

    // Create security user
    const securityPassword = await bcrypt.hash('security123', 10);
    await this.userModel.create({
      firstName: 'Security',
      lastName: 'User',
      email: 'security@example.com',
      password: securityPassword,
      phone: '1234567894',
      primaryRole: UserRole.SECURITY,
      estate: estate._id,
    });

    this.logger.log('Database seeding completed');
  }
}