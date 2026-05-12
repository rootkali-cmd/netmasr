"use client";

import PollCard from "@/components/PollCard";

interface PollOption {
  id: string;
  text: string;
  votes: number;
  order: number;
}

interface UserPoll {
  id: string;
  question: string;
  description: string | null;
  totalVotes: number;
  anonymousId: string;
  tripcode: string | null;
  createdAt: Date;
  category: { name: string; slug: string };
  options: PollOption[];
}

interface PollsClientProps {
  initialPolls: UserPoll[];
}

export default function PollsClient({ initialPolls }: PollsClientProps) {
  if (initialPolls.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        لا توجد تصويتات من المستخدمين حاليًا
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {initialPolls.map((poll) => (
        <PollCard
          key={poll.id}
          title={poll.question}
          description={poll.description || undefined}
          official={false}
          totalVotesLabel="إجمالي الأصوات"
          initialOptions={poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes }))}
          endDate={null}
          onVote={async (optionId: string) => {
            try {
              const res = await fetch(`/api/polls/${poll.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionId }),
              });
              return res.ok;
            } catch {
              return false;
            }
          }}
        />
      ))}
    </div>
  );
}
