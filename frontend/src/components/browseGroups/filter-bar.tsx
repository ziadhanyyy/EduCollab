import { Filter, MapPin, Monitor } from 'lucide-react';
import { SUBJECTS, TIME_OPTIONS } from '@/utils/constant';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

const FilterBar = ({
  selectedSubjects,
  toggleSubject,
  showOnline,
  setShowOnline,
  showOffline,
  setShowOffline,
  timeFilter,
  setTimeFilter,
}: {
  selectedSubjects: string[];
  toggleSubject: (subject: string) => void;
  showOnline: boolean;
  setShowOnline: (v: boolean) => void;
  showOffline: boolean;
  setShowOffline: (v: boolean) => void;
  timeFilter: string;
  setTimeFilter: (v: string) => void;
}) => {
  return (
    <aside className="w-52 shrink-0 space-y-5 pt-1">
      <h2 className="flex items-center gap-1.5 font-semibold text-sm">
        <Filter className="h-4 w-4" />
        Filters
      </h2>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</p>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => {
            const active = selectedSubjects.includes(s);
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggleSubject(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-foreground border-border hover:border-primary/50'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Meeting Type
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={showOnline}
              onCheckedChange={(v) => setShowOnline(!!v)}
              id="online"
            />
            <Label
              htmlFor="online"
              className="flex items-center gap-1.5 cursor-pointer text-sm font-normal"
            >
              <Monitor className="h-3.5 w-3.5 text-primary/70" />
              Online
            </Label>
          </div>
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={showOffline}
              onCheckedChange={(v) => setShowOffline(!!v)}
              id="offline"
            />
            <Label
              htmlFor="offline"
              className="flex items-center gap-1.5 cursor-pointer text-sm font-normal"
            >
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              Offline
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-sm">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
};

export default FilterBar;
