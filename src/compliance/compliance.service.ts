import { Injectable, Logger } from '@nestjs/common';
import { LeviesService } from '../levies/levies.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { Levy } from '../levies/entities/levy.entity';

export interface ComplianceStatus {
  isCompliant: boolean;
  canCreateToken: boolean;
  outstandingLevies: Levy[];
  totalOutstanding: number;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly leviesService: LeviesService,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  async checkUserCompliance(userId: string): Promise<ComplianceStatus> {
    try {
      // 1. Get user details
      const user = await this.usersService.findOne(userId);
      
      if (!user.estateId) {
        return {
          isCompliant: true,
          canCreateToken: true,
          outstandingLevies: [],
          totalOutstanding: 0,
        };
      }

      // 2. Get all enforced levies for this user's role and estate
      const enforcedLevies = await this.leviesService.getEnforcedLeviesForUser(
        userId,
        user.primaryRole,
        user.estateId.toString(),
      );

      // 3. Check which levies haven't been paid
      const outstandingLevies: Levy[] = [];
      let totalOutstanding = 0;

      for (const levy of enforcedLevies) {
        const hasPaid = await this.paymentsService.hasUserPaidLevy(userId, levy._id.toString());
        
        if (!hasPaid) {
          // Check if levy is past due date (including grace period)
          const effectiveDueDate = new Date(levy.dueDate);
          effectiveDueDate.setDate(effectiveDueDate.getDate() + (levy.gracePeriodDays || 0));
          
          if (new Date() > effectiveDueDate) {
            outstandingLevies.push(levy);
            totalOutstanding += levy.amount;
          }
        }
      }

      const isCompliant = outstandingLevies.length === 0;

      this.logger.debug(
        `Compliance check for user ${userId}: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (${outstandingLevies.length} outstanding levies)`
      );

      return {
        isCompliant,
        canCreateToken: isCompliant,
        outstandingLevies,
        totalOutstanding,
      };
    } catch (error) {
      this.logger.error(`Error checking compliance for user ${userId}: ${error.message}`);
      // In case of error, allow token creation (fail-open for better UX)
      return {
        isCompliant: true,
        canCreateToken: true,
        outstandingLevies: [],
        totalOutstanding: 0,
      };
    }
  }

  async getOutstandingLevies(userId: string): Promise<Levy[]> {
    const compliance = await this.checkUserCompliance(userId);
    return compliance.outstandingLevies;
  }

  async getEstateComplianceReport(estateId: string): Promise<any> {
    // Get all users in the estate
    const users = await this.usersService.findByEstate(estateId);
    
    const report = {
      totalUsers: users.length,
      compliantUsers: 0,
      nonCompliantUsers: 0,
      totalOutstanding: 0,
      userDetails: [] as any[],
    };

    for (const user of users) {
      const compliance = await this.checkUserCompliance(user._id.toString());
      
      if (compliance.isCompliant) {
        report.compliantUsers++;
      } else {
        report.nonCompliantUsers++;
        report.totalOutstanding += compliance.totalOutstanding;
      }

      report.userDetails.push({
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.primaryRole,
        isCompliant: compliance.isCompliant,
        outstandingAmount: compliance.totalOutstanding,
        outstandingLeviesCount: compliance.outstandingLevies.length,
      });
    }

    return report;
  }
}
