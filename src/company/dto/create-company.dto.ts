export class CreateCompanyDto {
  name: string;
  profileImage?: string;
  plan?: string;
  tier?: string;
  subscriptionStatus?: 'active' | 'suspended' | 'trial';
  subscriptionEnds?: Date;
  billingEmail: string;
  maxUsers?: number;
  maxVehicles?: number;
  currency?: string;
}
