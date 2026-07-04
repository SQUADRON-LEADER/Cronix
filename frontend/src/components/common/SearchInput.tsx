import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cronix-secondary" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-11 pr-11 py-3"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-4.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-cronix-muted/20 transition-all shadow-extruded-small flex items-center justify-center bg-cronix-bg-primary text-cronix-text"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
