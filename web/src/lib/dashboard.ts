import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  // Run ALL independent queries in parallel for maximum speed
  const [
    docCount, 
    taskCount, 
    applicationCount,
    recentDocs, 
    recentSavedSchemes, 
    recentTasks, 
    recentBookmarks,
    upcomingTasks
  ] = await Promise.all([
    // Basic Stats
    prisma.document.count({ where: { userId } }),
    prisma.complianceTask.count({ where: { userId, status: "PENDING" } }),
    prisma.application.count({ where: { userId } }),
    
    // Activity Stream Data
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { name: true, createdAt: true }
    }),
    prisma.savedScheme.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      take: 3,
      select: { schemeName: true, savedAt: true }
    }),
    prisma.complianceTask.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true }
    }),
    prisma.newsBookmark.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      take: 3,
      select: { title: true, savedAt: true }
    }),
    
    // Upcoming Tasks
    prisma.complianceTask.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { dueDate: "asc" },
      take: 3,
      select: { id: true, title: true, type: true, dueDate: true }
    })
  ]);

  // Consolidate into a single activity stream
  const recentActivity = [
    ...recentDocs.map(d => ({ type: "DOCUMENT", title: d.name, date: d.createdAt })),
    ...recentSavedSchemes.map(s => ({ type: "SCHEME", title: s.schemeName, date: s.savedAt })),
    ...recentTasks.map(t => ({ type: "TASK", title: t.title, date: t.createdAt })),
    ...recentBookmarks.map(b => ({ type: "NEWS", title: b.title, date: b.savedAt }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Mock recommendations for now
  const recommendedSchemes = [
    { 
      name: "MSME Idea Hackathon 3.0", 
      authority: "Ministry of MSME", 
      benefit: "Up to ₹15 Lakhs grant",
      deadline: "Oct 30, 2024"
    },
    { 
      name: "CLCSS for Technology Upgradation", 
      authority: "SIDBI", 
      benefit: "15% Capital Subsidy",
      deadline: "Ongoing"
    },
  ];

  return {
    stats: {
      docCount,
      taskCount,
      applicationCount,
      eligibleSchemes: 12, // Placeholder
    },
    recentActivity,
    upcomingTasks,
    recommendedSchemes,
  };
}
