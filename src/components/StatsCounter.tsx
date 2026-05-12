interface StatsCounterProps {
  postsCount: number;
  commentsCount: number;
  userPollsCount: number;
  officialPollVotes: number;
}

export default function StatsCounter({ postsCount, commentsCount, userPollsCount, officialPollVotes }: StatsCounterProps) {
  const stats = [
    { label: "المشاركات", value: postsCount, icon: "📝" },
    { label: "التعليقات", value: commentsCount, icon: "💬" },
    { label: "تصويتات المستخدمين", value: userPollsCount, icon: "📊" },
    { label: "أصوات الاستفتاءات", value: officialPollVotes, icon: "✅" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card text-center">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-2xl font-extrabold text-blue-600">
            {stat.value.toLocaleString("ar-EG")}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
