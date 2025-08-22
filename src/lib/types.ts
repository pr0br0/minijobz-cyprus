// Re-export types from database.ts to maintain backward compatibility
// All types should now be imported from @/types/database
export type {
  UserRole,
  JobStatus,
  ProfileVisibility,
  CompanySize,
  RemoteType,
  EmploymentType,
  SkillLevel,
  ApplicationStatus,
  AlertFrequency,
  PaymentStatus,
  PaymentType,
  SubscriptionPlan,
  SubscriptionStatus,
  ConsentType,
  ConsentAction,
} from '@/types/database';

// Re-export database interfaces for backward compatibility
export type {
  UserProfile,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application,
  Skill,
  Payment,
  Subscription,
} from '@/types/database';

// Legacy type aliases for backward compatibility
import type {
  EmploymentType,
  UserProfile,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application,
  JobStatus,
  UserRole,
} from '@/types/database';

export type JobType = EmploymentType;
export type User = UserProfile;
export type JobSeeker = JobSeekerProfile;
export type Employer = EmployerProfile;
// Additional convenient aliases (avoid introducing new direct imports elsewhere)
export type JobEntity = Job;
export type ApplicationEntity = Application;
export type JobStatusType = JobStatus;
export type UserRoleType = UserRole;