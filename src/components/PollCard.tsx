"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type PollOption = {
  id: string;
  text: string;
  votes: number;
};

type PollCardProps = {
  title: string;
  description?: string;
  official?: boolean;
  totalVotesLabel?: string;
  initialOptions: PollOption[];
  endDate?: Date | string | null;
  onVote: (optionId: string) => Promise<boolean>;
};

export default function PollCard({
  title,
  description,
  official = false,
  totalVotesLabel = "إجمالي الأصوات",
  initialOptions,
  endDate,
  onVote,
}: PollCardProps) {
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const totalVotes = useMemo(() => {
    return options.reduce((sum, option) => sum + option.votes, 0);
  }, [options]);

  function getPercentage(votes: number) {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  }

  async function handleVote(optionId: string) {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      const ok = await onVote(optionId);
      if (ok) {
        setSelectedId(optionId);
        setHasVoted(true);
        setOptions((current) =>
          current.map((option) =>
            option.id === optionId
              ? { ...option, votes: option.votes + 1 }
              : option
          )
        );
        toast.success("تم التصويت بنجاح");
      } else {
        toast.error("حدث خطأ في التصويت، حاول مرة أخرى");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
    setVoting(false);
  }

  return (
    <section dir="rtl" className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          {official && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              نت مصر
              <span
                title="منشور رسمي من إدارة NetMasr.org"
                className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#1877F2]"
              >
                <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6.5L9.5 17L4 11.5" />
                </svg>
              </span>
            </span>
          )}
          {!official && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
              تصويت مستخدم
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            استفتاء
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || voting}
              className={`relative w-full overflow-hidden rounded-xl border text-right transition ${
                hasVoted || voting
                  ? "border-gray-200 bg-gray-50 cursor-default"
                  : "border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer active:bg-blue-100"
              } ${isSelected && hasVoted ? "ring-2 ring-blue-500" : ""}`}
              style={{ padding: "16px" }}
            >
              {hasVoted && (
                <div
                  className="absolute inset-y-0 right-0 bg-blue-100 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center gap-3">
                {hasVoted && (
                  <span className="min-w-[48px] rounded-full bg-blue-600 px-2.5 py-1 text-center text-sm font-bold text-white">
                    {percentage}%
                  </span>
                )}

                {isSelected && hasVoted && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    اختيارك
                  </span>
                )}

                <div className="flex-1">
                  <p className="font-bold text-gray-900">{option.text}</p>
                  {hasVoted && (
                    <p className="mt-1 text-xs text-gray-500">
                      {option.votes} صوت
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
        <span className="font-bold">{totalVotesLabel}</span>
        <span className="font-bold text-gray-900">{totalVotes}</span>
      </div>

      {endDate && (
        <p className="mt-2 text-xs text-gray-400">
          ينتهي: {formatDate(endDate)}
        </p>
      )}

      {hasVoted && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          تم تسجيل صوتك. هذه نتائج تصويت مجتمعي عام مع تطبيق إجراءات للحد من التلاعب.
        </p>
      )}
    </section>
  );
}
