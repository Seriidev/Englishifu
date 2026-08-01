interface TaskTransitionProps {
  title: string
  body: string
  onContinue: () => void
}

export default function TaskTransition({
  title,
  body,
  onContinue,
}: TaskTransitionProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
        Instructions
      </p>
      <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-muted">{body}</p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-10 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Continue
      </button>
    </div>
  )
}
