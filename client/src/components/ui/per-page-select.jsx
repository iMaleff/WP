import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PerPageSelect = ({ value, onChange }) => {
  const options = [10, 25, 50, 100]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Показывать по:</span>
      <Select value={value.toString()} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { PerPageSelect } 