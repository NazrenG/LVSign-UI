import { DEPARTMENTS } from '@/constants/departments';
import { cn } from '@/utils/cn';

/** Segmented control: Staff | HR | Finance | Admin */
export function DepartmentPicker({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">I work in</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DEPARTMENTS.map((department) => {
          const isSelected = department === value;
          return (
            <button
              key={department}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(department)}
              className={cn(
                'h-11 rounded-sm border text-[15px] font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line-strong bg-surface text-ink hover:bg-canvas',
              )}
            >
              {department}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
