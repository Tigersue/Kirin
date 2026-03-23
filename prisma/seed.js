const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.performanceData.deleteMany();
  await prisma.application.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.merchantProfile.deleteMany();
  await prisma.influencerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Merchant
  const merchantUser = await prisma.user.create({
    data: {
      email: "merchant@example.com",
      password: "password123",
      name: "品牌方-小王",
      role: "MERCHANT",
      merchantProfile: {
        create: {
          brandName: "麒麟科技",
          industry: "消费电子",
          website: "https://qilin.tech",
          description: "专注创新数码产品，致力于通过科技提升生活品质。",
          balance: 100000,
        },
      },
    },
  });

  const merchantProfile = await prisma.merchantProfile.findFirst({
    where: { userId: merchantUser.id },
  });

  // Create Influencer
  const influencerUser = await prisma.user.create({
    data: {
      email: "influencer@example.com",
      password: "password123",
      name: "达人-小美",
      role: "INFLUENCER",
      influencerProfile: {
        create: {
          bio: "知名科技博主，专注好物推荐。",
          tags: JSON.stringify(["科技", "数码", "生活"]),
          platforms: JSON.stringify(["小红书", "Bilibili"]),
          followerCount: 1250000,
          rating: 4.9,
          balance: 0,
        },
      },
    },
  });

  // Create Campaigns
  await prisma.campaign.create({
    data: {
      merchantId: merchantProfile.id,
      title: "2024夏季新品无线耳机测评招募",
      description: "我们需要 5 名专注于数码测评的达人，为我们即将发布的 'Qilin Air Pro' 无线耳机进行深度体验分享。\n\n要求：\n1. 粉丝量 10W+\n2. 视频产出质量高，画质清晰\n3. 能够突出产品的降噪与音质卖点\n4. 在申请中请附带过往相关案例链接。",
      platform: "小红书",
      budget: 8500,
      status: "OPEN",
      deadline: new Date("2024-08-31"),
    },
  });

  await prisma.campaign.create({
    data: {
      merchantId: merchantProfile.id,
      title: "麒麟极简充电宝 - 潮流种草活动",
      description: "寻找 10 名生活方式类达人，展示充电宝的极简设计与便携性。视频或图文形式均可。",
      platform: "抖音",
      budget: 5000,
      status: "OPEN",
      deadline: new Date("2024-09-15"),
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
