import { Job, JobSearch, UserProfile } from '@/lib/types/jobs';

export const dummyUserProfile: UserProfile = {
  name: "Martin Silva Molina",
  title: "Full-Stack Developer | Modern Mobile & Web Applications | Flutter, React Native, Next.js, Node.js",
  location: "Zagreb, Zagreb",
  avatar: "/images/avatar-placeholder.jpg",
  isVerified: true,
  website: "mytalents.ai",
  isPremium: true
};

export const dummyJobSearches: JobSearch[] = [
  { id: "1", title: "remote", isActive: true },
  { id: "2", title: "Full Stack Engineer", isActive: true },
  { id: "3", title: "Javascript Developer", isActive: true },
  { id: "4", title: "Back End Developer", isActive: true },
  { id: "5", title: "Mobile Engineer", isActive: true },
  { id: "6", title: "Mobile Application Developer", isActive: true },
  { id: "7", title: "Frontend Developer", isActive: true },
];

export const dummyJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "True North",
    location: "Zagreb, Croatia (Hybrid)",
    type: "full-time",
    salary: {
      min: 80000,
      max: 120000,
      currency: "EUR",
      period: "yearly"
    },
    description: "We are looking for a Senior Frontend Engineer to join our growing team. You will be responsible for building and maintaining our web applications using modern technologies.",
    requirements: [
      "5+ years of experience in frontend development",
      "Strong knowledge of React, TypeScript, and modern CSS",
      "Experience with state management libraries",
      "Knowledge of testing frameworks"
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "Flexible working hours",
      "Professional development budget"
    ],
    postedAt: "2 days ago",
    isPromoted: true,
    isEasyApply: true,
    isActivelyReviewing: true,
    experienceLevel: "senior",
    skills: ["React", "TypeScript", "CSS", "JavaScript", "Frontend"]
  },
  {
    id: "2",
    title: "Senior Frontend Developer (m/f)",
    company: "Njuškalo",
    location: "Zagreb, Zagreb, Croatia (Hybrid)",
    type: "full-time",
    description: "Join our team as a Senior Frontend Developer and help us build amazing user experiences for our platform.",
    requirements: [
      "4+ years of frontend development experience",
      "Proficiency in JavaScript/TypeScript",
      "Experience with modern frontend frameworks",
      "Strong problem-solving skills"
    ],
    benefits: [
      "Competitive compensation",
      "Work-life balance",
      "Learning opportunities",
      "Team events"
    ],
    postedAt: "1 month ago",
    connectionsCount: 4,
    experienceLevel: "senior",
    skills: ["JavaScript", "TypeScript", "React", "Vue", "Frontend"]
  },
  {
    id: "3",
    title: "Senior Full Stack Frontend Engineer (React + PHP)",
    company: "AlfaDocs.com",
    location: "Croatia (Remote)",
    type: "full-time",
    salary: {
      min: 70000,
      max: 100000,
      currency: "EUR",
      period: "yearly"
    },
    description: "We're seeking a Senior Full Stack Frontend Engineer with strong React and PHP skills to join our remote team.",
    requirements: [
      "5+ years of full-stack development",
      "Expert knowledge of React and PHP",
      "Experience with REST APIs",
      "Strong database skills"
    ],
    benefits: [
      "Remote work",
      "Flexible schedule",
      "Health benefits",
      "Stock options"
    ],
    postedAt: "1 week ago",
    isEasyApply: true,
    isActivelyReviewing: true,
    experienceLevel: "senior",
    skills: ["React", "PHP", "JavaScript", "Full Stack", "API"]
  },
  {
    id: "4",
    title: "Frontend Engineer (JavaScript)",
    company: "Wiraa",
    location: "United States (Remote)",
    type: "full-time",
    salary: {
      min: 190000,
      max: 230000,
      currency: "USD",
      period: "yearly"
    },
    description: "Join our innovative team as a Frontend Engineer and help build cutting-edge web applications.",
    requirements: [
      "3+ years of JavaScript development",
      "Experience with modern frameworks",
      "Strong CSS skills",
      "API integration experience"
    ],
    benefits: [
      "Vision insurance",
      "Dental insurance",
      "401k matching",
      "Unlimited PTO"
    ],
    postedAt: "37 minutes ago",
    experienceLevel: "mid",
    skills: ["JavaScript", "React", "CSS", "API", "Frontend"]
  },
  {
    id: "5",
    title: "Frontend Developer",
    company: "Technogen, Inc.",
    location: "Kentucky, United States (Remote)",
    type: "full-time",
    description: "We are looking for a talented Frontend Developer to join our team and help create amazing user experiences.",
    requirements: [
      "2+ years of frontend development",
      "HTML, CSS, JavaScript proficiency",
      "Framework experience preferred",
      "Good communication skills"
    ],
    benefits: [
      "Health insurance",
      "Paid time off",
      "Professional development",
      "Team building activities"
    ],
    postedAt: "1 hour ago",
    isEasyApply: true,
    experienceLevel: "mid",
    skills: ["HTML", "CSS", "JavaScript", "Frontend", "UI/UX"]
  },
  {
    id: "6",
    title: "Frontend Developer",
    company: "Hirenza",
    location: "United States (Remote)",
    type: "full-time",
    description: "Join Hirenza as a Frontend Developer and work on exciting projects with a talented team.",
    requirements: [
      "3+ years of frontend experience",
      "Strong JavaScript skills",
      "Experience with modern tools",
      "Collaborative mindset"
    ],
    benefits: [
      "Competitive salary",
      "Remote work",
      "Health benefits",
      "Learning budget"
    ],
    postedAt: "1 hour ago",
    experienceLevel: "mid",
    skills: ["JavaScript", "React", "CSS", "Frontend", "Development"]
  }
];
