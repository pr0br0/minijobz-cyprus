import { PrismaClient } from '@prisma/client';
// Using raw string enum values to avoid enum import mismatches during migration
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyprusjobs.com' },
    update: {},
    create: {
      email: 'admin@cyprusjobs.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
      dataRetentionConsent: true,
      marketingConsent: true,
      jobAlertConsent: true,
    },
  });

  // Create job seekers
  const jobSeeker1Password = await bcrypt.hash('password123', 12);
  const jobSeeker1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: jobSeeker1Password,
      name: 'John Doe',
      role: 'JOB_SEEKER',
      emailVerified: true,
      dataRetentionConsent: true,
      marketingConsent: true,
      jobAlertConsent: true,
      jobSeeker: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+35799123456',
          location: 'Nicosia',
          country: 'Cyprus',
          bio: 'Experienced software developer with 5 years of experience in web development.',
          title: 'Senior Software Developer',
          experience: 5,
          education: 'Bachelor of Computer Science',
          profileVisibility: 'PUBLIC',
        },
      },
    },
  });

  const jobSeeker2Password = await bcrypt.hash('password123', 12);
  const jobSeeker2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: jobSeeker2Password,
      name: 'Jane Smith',
      role: 'JOB_SEEKER',
      emailVerified: true,
      dataRetentionConsent: true,
      marketingConsent: false,
      jobAlertConsent: true,
      jobSeeker: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+35799789012',
          location: 'Limassol',
          country: 'Cyprus',
          bio: 'Marketing professional with expertise in digital marketing and brand management.',
          title: 'Marketing Manager',
          experience: 7,
          education: 'MBA in Marketing',
          profileVisibility: 'PUBLIC',
        },
      },
    },
  });

  // Create employers
  const employer1Password = await bcrypt.hash('password123', 12);
  const employer1User = await prisma.user.upsert({
    where: { email: 'techcorp@cyprusjobs.com' },
    update: {},
    create: {
      email: 'techcorp@cyprusjobs.com',
      password: employer1Password,
      name: 'TechCorp Cyprus',
      role: 'EMPLOYER',
      emailVerified: true,
      dataRetentionConsent: true,
      marketingConsent: true,
      jobAlertConsent: false,
    },
  });

  const employer1 = await prisma.employer.upsert({
    where: { userId: employer1User.id },
    update: {},
    create: {
      userId: employer1User.id,
      companyName: 'TechCorp Cyprus',
      description: 'Leading technology company specializing in software development and IT solutions.',
      website: 'https://techcorp.com.cy',
      industry: 'Technology',
      size: 'MEDIUM',
      contactName: 'Michael Brown',
      contactEmail: 'michael@techcorp.com.cy',
      contactPhone: '+35722123456',
      address: 'Tech Park, Nicosia',
      city: 'Nicosia',
      postalCode: '1065',
      country: 'Cyprus',
      company: {
        create: {
          mission: 'To innovate and provide cutting-edge technology solutions for businesses in Cyprus.',
          values: 'Innovation, Excellence, Customer Focus, Teamwork',
          benefits: 'Competitive salary, Health insurance, Professional development, Flexible working hours',
        },
      },
    },
  });

  const employer2Password = await bcrypt.hash('password123', 12);
  const employer2User = await prisma.user.upsert({
    where: { email: 'hospitality@cyprusjobs.com' },
    update: {},
    create: {
      email: 'hospitality@cyprusjobs.com',
      password: employer2Password,
      name: 'Mediterranean Hotels',
      role: 'EMPLOYER',
      emailVerified: true,
      dataRetentionConsent: true,
      marketingConsent: true,
      jobAlertConsent: false,
    },
  });

  const employer2 = await prisma.employer.upsert({
    where: { userId: employer2User.id },
    update: {},
    create: {
      userId: employer2User.id,
      companyName: 'Mediterranean Hotels',
      description: 'Luxury hotel chain operating across Cyprus with premium resorts and hotels.',
      website: 'https://medhotels.com.cy',
      industry: 'Hospitality',
      size: 'LARGE',
      contactName: 'Maria Antoniou',
      contactEmail: 'maria@medhotels.com.cy',
      contactPhone: '+35725876543',
      address: 'Paphos Coastal Road',
      city: 'Paphos',
      postalCode: '8010',
      country: 'Cyprus',
      company: {
        create: {
          mission: 'To provide exceptional hospitality experiences and create memorable moments for our guests.',
          values: 'Excellence, Hospitality, Sustainability, Innovation',
          benefits: 'Competitive salary, Accommodation discounts, Health insurance, Training programs',
        },
      },
    },
  });

  // Create skills
  const skills = [
    { name: 'JavaScript', category: 'Programming' },
    { name: 'React', category: 'Programming' },
    { name: 'Node.js', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'SQL', category: 'Database' },
    { name: 'Digital Marketing', category: 'Marketing' },
    { name: 'SEO', category: 'Marketing' },
    { name: 'Content Marketing', category: 'Marketing' },
    { name: 'Customer Service', category: 'Hospitality' },
    { name: 'Hotel Management', category: 'Hospitality' },
    { name: 'Project Management', category: 'Management' },
    { name: 'Team Leadership', category: 'Management' },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  // Create jobs
  console.log('Employer 1 ID:', employer1?.id);
  console.log('Employer 2 ID:', employer2?.id);
  
  const employer1Id = employer1?.id || '';
  const employer2Id = employer2?.id || '';

  if (!employer1Id || !employer2Id) {
    console.error('Employer 1:', employer1);
    console.error('Employer 2:', employer2);
    throw new Error('Employer IDs not found');
  }

  const jobs = [
    {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced Frontend Developer to join our dynamic team. The ideal candidate will have strong experience with React, TypeScript, and modern web development practices.',
      requirements: '5+ years of experience with React, TypeScript, and modern JavaScript frameworks. Experience with state management, responsive design, and testing frameworks.',
      responsibilities: 'Develop and maintain web applications, collaborate with backend developers, participate in code reviews, and mentor junior developers.',
      location: 'Nicosia',
      remote: 'HYBRID',
      type: 'FULL_TIME',
      salaryMin: 45000,
      salaryMax: 65000,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@techcorp.com.cy',
      status: 'PUBLISHED',
      featured: true,
      urgent: false,
      employerId: employer1Id,
    },
    {
      title: 'Digital Marketing Specialist',
      description: 'Join our marketing team to drive digital growth and brand awareness. This role involves managing digital campaigns, SEO, and content marketing strategies.',
      requirements: '3+ years of experience in digital marketing, strong knowledge of SEO, Google Analytics, and social media marketing. Experience with marketing automation tools.',
      responsibilities: 'Develop and execute digital marketing campaigns, manage SEO strategies, create content, analyze campaign performance, and optimize marketing funnels.',
      location: 'Limassol',
      remote: 'ONSITE',
      type: 'FULL_TIME',
      salaryMin: 35000,
      salaryMax: 45000,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@techcorp.com.cy',
      status: 'PUBLISHED',
      featured: false,
      urgent: true,
      employerId: employer1Id,
    },
    {
      title: 'Hotel Manager',
      description: 'We are seeking an experienced Hotel Manager to oversee our luxury resort in Paphos. The ideal candidate will have strong leadership skills and extensive hospitality experience.',
      requirements: '7+ years of hotel management experience, strong leadership skills, knowledge of hotel operations, and excellent customer service skills.',
      responsibilities: 'Oversee daily hotel operations, manage staff, ensure guest satisfaction, handle budgeting and financial management, and maintain high service standards.',
      location: 'Paphos',
  remote: 'ONSITE',
  type: 'FULL_TIME',
      salaryMin: 55000,
      salaryMax: 75000,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@medhotels.com.cy',
  status: 'PUBLISHED',
      featured: true,
      urgent: true,
      employerId: employer2Id,
    },
    {
      title: 'Backend Developer',
      description: 'Looking for a skilled Backend Developer to build scalable server-side applications. Experience with Node.js, Python, and cloud platforms is essential.',
      requirements: '4+ years of backend development experience, strong knowledge of Node.js, Python, databases, and RESTful APIs. Experience with cloud platforms preferred.',
      responsibilities: 'Design and develop backend services, create APIs, optimize database performance, implement security measures, and collaborate with frontend teams.',
      location: 'Nicosia',
  remote: 'REMOTE',
  type: 'FULL_TIME',
      salaryMin: 40000,
      salaryMax: 60000,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@techcorp.com.cy',
  status: 'PUBLISHED',
      featured: false,
      urgent: false,
      employerId: employer1Id,
    },
    {
      title: 'Guest Relations Manager',
      description: 'Join our luxury hotel team as a Guest Relations Manager. This role focuses on providing exceptional guest experiences and managing VIP services.',
      requirements: '5+ years in hospitality, excellent communication skills, multilingual abilities (Greek, English, Russian preferred), and strong problem-solving skills.',
      responsibilities: 'Manage guest relations, handle VIP guests, resolve guest issues, train staff on customer service, and maintain high guest satisfaction scores.',
      location: 'Paphos',
  remote: 'ONSITE',
  type: 'FULL_TIME',
      salaryMin: 32000,
      salaryMax: 42000,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@medhotels.com.cy',
  status: 'PUBLISHED',
      featured: false,
      urgent: false,
      employerId: employer2Id,
    },
    {
      title: 'Marketing Intern',
      description: 'Exciting opportunity for a marketing student to gain hands-on experience in digital marketing, content creation, and social media management.',
      requirements: 'Currently pursuing a degree in Marketing or related field. Basic knowledge of social media platforms and content creation tools.',
      responsibilities: 'Assist with social media management, content creation, campaign support, market research, and administrative tasks.',
      location: 'Limassol',
  remote: 'HYBRID',
  type: 'INTERNSHIP',
      salaryMin: 800,
      salaryMax: 1200,
      salaryCurrency: 'EUR',
      applicationEmail: 'careers@techcorp.com.cy',
  status: 'PUBLISHED',
      featured: false,
      urgent: false,
      employerId: employer1Id,
    },
  ];

  for (const job of jobs) {
    const createdJob = await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        location: job.location,
        remote: job.remote as any,
        type: job.type as any,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        applicationEmail: job.applicationEmail,
        status: job.status as any,
        featured: job.featured,
        urgent: job.urgent,
        employerId: job.employerId,
        publishedAt: new Date(),
      },
    });

    // Add skills to jobs
    const jobSkills = [];
    if (createdJob.title.includes('Frontend') || createdJob.title.includes('Backend') || createdJob.title.includes('Developer')) {
      jobSkills.push('JavaScript', 'React', 'Node.js');
    } else if (createdJob.title.includes('Marketing')) {
      jobSkills.push('Digital Marketing', 'SEO', 'Content Marketing');
    } else if (createdJob.title.includes('Hotel') || createdJob.title.includes('Guest')) {
      jobSkills.push('Customer Service', 'Hotel Management');
    } else if (createdJob.title.includes('Manager')) {
      jobSkills.push('Project Management', 'Team Leadership');
    }

    for (const skillName of jobSkills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (skill) {
        await prisma.jobSkill.create({
          data: {
            jobId: createdJob.id,
            skillId: skill.id,
          },
        });
      }
    }
  }

  // Fetch created job seeker profiles
  const jobSeeker1Profile = await prisma.jobSeeker.findUnique({ where: { userId: jobSeeker1.id } });
  const jobSeeker2Profile = await prisma.jobSeeker.findUnique({ where: { userId: jobSeeker2.id } });

  // Add skills to job seekers
  const jobSeeker1Skills = ['JavaScript', 'React', 'Node.js', 'Project Management'];
  for (const skillName of jobSeeker1Skills) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (skill && jobSeeker1Profile) {
      await prisma.jobSeekerSkill.create({
        data: {
          jobSeekerId: jobSeeker1Profile.id,
          skillId: skill.id,
          level: 'ADVANCED',
        },
      });
    }
  }

  const jobSeeker2Skills = ['Digital Marketing', 'SEO', 'Content Marketing', 'Team Leadership'];
  for (const skillName of jobSeeker2Skills) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (skill && jobSeeker2Profile) {
      await prisma.jobSeekerSkill.create({
        data: {
          jobSeekerId: jobSeeker2Profile.id,
          skillId: skill.id,
          level: 'ADVANCED',
        },
      });
    }
  }

  // Create some applications
  const allJobs = await prisma.job.findMany({ take: 3 });
  
  if (jobSeeker1Profile && allJobs.length > 0) {
    await prisma.application.create({
      data: {
        jobSeekerId: jobSeeker1Profile.id,
        jobId: allJobs[0].id,
        coverLetter: 'I am very interested in this position and believe my skills match perfectly with your requirements.',
  status: 'APPLIED',
      },
    });

    if (allJobs.length > 1) {
  await prisma.application.create({
        data: {
      jobSeekerId: jobSeeker1Profile.id,
          jobId: allJobs[1].id,
          coverLetter: 'This role aligns perfectly with my career goals and expertise.',
          status: 'SHORTLISTED',
        },
      });
    }
  }

  if (jobSeeker2Profile && allJobs.length > 2) {
    await prisma.application.create({
      data: {
    jobSeekerId: jobSeeker2Profile.id,
        jobId: allJobs[2].id,
        coverLetter: 'I would be thrilled to join your team and contribute to your success.',
  status: 'INTERVIEW',
      },
    });
  }

  // Create job alerts
  if (jobSeeker1Profile) {
    await prisma.jobAlert.create({
      data: {
    jobSeekerId: jobSeeker1Profile.id,
        title: 'Developer',
        location: 'Nicosia',
  jobType: 'FULL_TIME',
        emailAlerts: true,
        frequency: 'DAILY',
        active: true,
      },
    });
  }

  if (jobSeeker2Profile) {
    await prisma.jobAlert.create({
      data: {
    jobSeekerId: jobSeeker2Profile.id,
        industry: 'Marketing',
  jobType: 'FULL_TIME',
        emailAlerts: true,
        frequency: 'WEEKLY',
        active: true,
      },
    });
  }

  // Create some saved jobs
  if (jobSeeker1Profile && allJobs.length > 0) {
    await prisma.savedJob.create({
      data: {
        jobSeekerId: jobSeeker1Profile.id,
        jobId: allJobs[0].id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test Users:');
  console.log('   Admin: admin@cyprusjobs.com / admin123');
  console.log('   Job Seeker 1: john.doe@example.com / password123');
  console.log('   Job Seeker 2: jane.smith@example.com / password123');
  console.log('   Employer 1: techcorp@cyprusjobs.com / password123');
  console.log('   Employer 2: hospitality@cyprusjobs.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });