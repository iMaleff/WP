import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SortIcon = ({ direction, active, className }) => {
  if (!active) {
    return <ChevronsUpDown className={cn("h-4 w-4 opacity-50", className)} />
  }
  
  return direction === 'asc' ? (
    <ChevronUp className={cn("h-4 w-4", className)} />
  ) : (
    <ChevronDown className={cn("h-4 w-4", className)} />
  )
}

export { SortIcon } 