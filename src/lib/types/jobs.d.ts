export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  isPromoted?: boolean;
  isEasyApply?: boolean;
  connectionsCount?: number;
  isActivelyReviewing?: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  skills: string[];
}

export interface JobSearch {
  id: string;
  title: string;
  location?: string;
  isActive: boolean;
}

export interface UserProfile {
  name: string;
  title: string;
  location: string;
  avatar?: string;
  isVerified?: boolean;
  website?: string;
  isPremium?: boolean;
}
