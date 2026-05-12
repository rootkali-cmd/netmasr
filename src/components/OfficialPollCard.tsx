"use client";

import PollCard from "./PollCard";

interface Option {
  id: string;
  text: string;
  votes: number;
  order: number;
}

interface OfficialPoll {
  id: string;
  title: string;
  description: string | null;
  totalVotes: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string | null;
  options: Option[];
}

interface OfficialPollCardProps {
  poll: OfficialPoll;
  readonly?: boolean;
}

export default function OfficialPollCard({ poll, readonly }: OfficialPollCardProps) {
  return (
    <PollCard
      title={poll.title}
      description={poll.description || undefined}
      official
      totalVotesLabel="إجمالي الأصوات"
      initialOptions={poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes }))}
      endDate={null}
      onVote={async (optionId: string) => {
        if (readonly) return false;
        try {
          const res = await fetch(`/api/official-polls/${poll.id}/vote`, {
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
  );
}
