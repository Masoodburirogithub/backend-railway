const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@aurachronsys.com' },
    update: {},
    create: {
      email: 'admin@aurachronsys.com',
      password: adminPassword,
      role: 'admin'
    }
  });
  console.log('✅ Admin user created');



  const defaultMenus = [
  { name: 'Work', path: '/case-studies', order: 1, isActive: true, isDropdown: false },
  { name: 'Services', path: '#', order: 2, isActive: true, isDropdown: true, dropdownItems: [
    { name: 'AI Development', path: '/services/ai-development' },
    { name: 'Enterprise SaaS', path: '/services/saas' },
    { name: 'Web & Mobile Apps', path: '/services/web-mobile' }
  ]},
  { name: 'About', path: '/about', order: 3, isActive: true, isDropdown: false },
  { name: 'Careers', path: '/careers', order: 4, isActive: true, isDropdown: false },
  { name: 'Contact', path: '/contact', order: 5, isActive: true, isDropdown: false }
];




  // Create sample case studies
  const caseStudies = [
    {
      title: "Gulf Oil — Eliminated 85% of Safety Incident Reporting Time",
      industry: "Oil & Gas",
      technology: "AI Agents, RAG Pipeline",
      challenge: "500+ sites reporting safety incidents manually taking 4+ hours per incident, leading to delayed responses and incomplete data.",
      solution: "Developed an AI-powered safety reporting system with computer vision for automatic incident detection, RAG pipeline for regulatory compliance, and mobile-first app for field workers.",
      result: "85% reduction in reporting time (from 4 hours to 30 minutes). Real-time dashboards for HQ with live incident tracking.",
      imageUrl: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800",
      displayOrder: 1,
      isActive: true
    },
    {
      title: "Real Estate AI — From Minutes to Seconds",
      industry: "PropTech",
      technology: "LLM Integration, RAG",
      challenge: "Proposal creation took 45 minutes per document with inconsistent quality and formatting issues across the team.",
      solution: "LLM-based proposal generation system that pulls client data, property details, and market analysis to create professional proposals.",
      result: "70% faster proposal turnaround (45 minutes → 15 seconds). 90% client satisfaction rate.",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      displayOrder: 2,
      isActive: true
    }
  ];

  for (const study of caseStudies) {
    await prisma.caseStudy.upsert({
      where: { id: study.title },
      update: {},
      create: study
    });
  }
  console.log('✅ Sample case studies created');


  // backend/prisma/seed.js - Add default services
const defaultServices = [
  {
    title: "AI Development & Agents",
    description: "Custom AI agents, LLM integrations, RAG pipelines, and AI enablement — from strategy to production",
    icon: "Brain",
    features: ["Agentic AI Solutions", "LLM Integration & RAG", "AI Enablement Consulting", "Intelligent Document Processing"],
    gradient: "from-blue-500 to-indigo-500",
    color: "blue",
    displayOrder: 1,
    isActive: true
  },
  {
    title: "Enterprise SaaS",
    description: "Multi-tenant architecture, subscription management, SOC2-ready logging that scales from 10 to 100k users",
    icon: "Cloud",
    features: ["Multi-tenant Architecture", "Subscription Management", "SOC2 Ready", "Scalable Infrastructure"],
    gradient: "from-cyan-500 to-blue-500",
    color: "cyan",
    displayOrder: 2,
    isActive: true
  },
  // Add more services...
];

// Add to seed function
for (const service of defaultServices) {
  await prisma.service.upsert({
    where: { id: service.title },
    update: {},
    create: service
  });
}

  // Create sample career positions
  const positions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Karachi (Hybrid)",
      type: "Full-time",
      experience: "5+ years",
      description: "We are looking for a Senior Full Stack Engineer to join our growing team...",
      requirements: ["React/Next.js", "Node.js", "PostgreSQL", "TypeScript"],
      isActive: true
    },
    {
      title: "AI/ML Engineer",
      department: "AI",
      location: "Karachi (Hybrid)",
      type: "Full-time",
      experience: "3+ years",
      description: "Join our AI team to build cutting-edge solutions...",
      requirements: ["Python", "TensorFlow/PyTorch", "LLMs", "RAG"],
      isActive: true
    }
  ];

  for (const position of positions) {
    await prisma.careerPosition.upsert({
      where: { id: position.title },
      update: {},
      create: position
    });
  }
  console.log('✅ Sample career positions created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });