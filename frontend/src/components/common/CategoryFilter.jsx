// Selected / idle styles per colour tone (full class names so Tailwind can find them)
const TONES = {
  primary: {
    chipActive: 'bg-primary border-primary text-white shadow-md shadow-primary/15',
    chipIdle: 'hover:text-primary hover:bg-primary/5 hover:border-primary/30',
    itemActive: 'bg-primary text-white shadow-md shadow-primary/20',
    itemIdle: 'hover:text-primary hover:bg-primary/5',
  },
  danger: {
    chipActive: 'bg-danger border-danger text-white shadow-md shadow-danger/15',
    chipIdle: 'hover:text-danger hover:bg-danger/5 hover:border-danger/30',
    itemActive: 'bg-danger text-white shadow-md shadow-danger/20',
    itemIdle: 'hover:text-danger hover:bg-danger/5',
  },
};

// Category picker for the catalog pages (doctors, pharmacy, labs, emergency).
// Phones and tablets get a swipeable chip row above the cards; desktops get a sidebar beside them.
function CategoryFilter({ title, options, value, onChange, tone = 'primary' }) {
  const styles = TONES[tone] || TONES.primary;

  return (
    <>
      {/* Phone & tablet: horizontal chip row (bleeds to the screen edge so it reads as scrollable) */}
      <div
        role="group"
        aria-label={title}
        className="lg:hidden w-[calc(100%+3rem)] -mx-6 px-6 flex gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all duration-300 border ${
              value === option ? styles.chipActive : `bg-bg-base/50 border-border-color text-text-sub ${styles.chipIdle}`
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Desktop: sticky sidebar list */}
      <aside className="hidden lg:flex flex-col gap-2 w-64 shrink-0 glass-panel rounded-3xl p-6 sticky top-24">
        <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-3 border-b border-border-color pb-2">
          {title}
        </h3>
        <div role="group" aria-label={title} className="flex flex-col gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold font-body transition-all duration-300 border-0 ${
                value === option ? styles.itemActive : `text-text-sub bg-transparent ${styles.itemIdle}`
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

export default CategoryFilter;
