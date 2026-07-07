import React, { useCallback } from "react";
import { useLocale } from "../hooks/useLocale";
import { PROFILE_PROMPTS, MAX_PROMPTS, MAX_PROMPT_ANSWER } from "../utils/prompts";

function PromptEditor({ prompts, onChange }) {
  const { t, locale } = useLocale();
  const usedIds = prompts.map((p) => p.id);

  const updateAt = useCallback((idx, patch) => {
    onChange(prompts.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }, [prompts, onChange]);

  const removeAt = useCallback((idx) => {
    onChange(prompts.filter((_, i) => i !== idx));
  }, [prompts, onChange]);

  const addPrompt = useCallback(() => {
    if (prompts.length >= MAX_PROMPTS) return;
    const nextId = PROFILE_PROMPTS.find((p) => !usedIds.includes(p.id))?.id;
    if (!nextId) return;
    onChange([...prompts, { id: nextId, answer: "" }]);
  }, [prompts, usedIds, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-[19px] text-[#1E1B18]">{t.promptsSectionTitle}</p>
        <p className="text-[13px] text-[#8A837B] mt-1 leading-relaxed">{t.promptsSectionDesc}</p>
      </div>

      {prompts.map((prompt, idx) => (
        <div key={`${prompt.id}-${idx}`} className="rounded-[18px] border border-[#E5DED2] bg-[#FAF7F2] p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`prompt-select-${idx}`} className="sr-only">{t.promptSelectLabel}</label>
            <select
              id={`prompt-select-${idx}`}
              className="flex-1 bg-transparent font-display text-[15px] text-[#4A1D3F] cursor-pointer pr-2 focus:outline-none"
              value={prompt.id}
              onChange={(e) => updateAt(idx, { id: e.target.value })}
            >
              {PROFILE_PROMPTS.filter((p) => p.id === prompt.id || !usedIds.includes(p.id)).map((p) => (
                <option key={p.id} value={p.id}>{locale === "ko" ? p.ko : p.en}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label={t.promptRemoveBtn}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#8A837B] hover:text-[#C4402E] hover:bg-[#FBEAE6] transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <textarea
            rows={3}
            className="input-field resize-none text-[14px]"
            value={prompt.answer}
            maxLength={MAX_PROMPT_ANSWER}
            onChange={(e) => updateAt(idx, { answer: e.target.value })}
            placeholder={t.promptAnswerPlaceholder}
            aria-label={t.promptAnswerPlaceholder}
          />
          <p className="text-right text-[11px] text-[#B3AB9F]">{prompt.answer.length}/{MAX_PROMPT_ANSWER}</p>
        </div>
      ))}

      {prompts.length < MAX_PROMPTS ? (
        <button
          type="button"
          onClick={addPrompt}
          className="w-full rounded-full border border-dashed border-[#4A1D3F]/30 py-3 text-[13px] font-semibold text-[#4A1D3F] hover:bg-[#F1E9EE] transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t.promptAddBtn}
        </button>
      ) : (
        <p className="text-center text-[12px] text-[#B3AB9F]">{t.promptMaxReached}</p>
      )}
    </div>
  );
}

export default React.memo(PromptEditor);
