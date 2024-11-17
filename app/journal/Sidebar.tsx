import { useState, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

interface Entry {
  date: string
  content: string
}

export function Sidebar({ selectedDate, onDateSelect }: SidebarProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({})
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/entries')
        if (response.ok) {
          const data = await response.json()
          setEntries(data)
          
          const selectedYear = selectedDate.substring(0, 4)
          const selectedMonth = selectedDate.substring(0, 7)
          
          setExpandedYears(prev => ({
            ...prev,
            [selectedYear]: true
          }))
          
          setExpandedMonths(prev => ({
            ...prev,
            [selectedMonth]: true
          }))
        }
      } catch (error) {
        console.error('Error fetching entries:', error)
      }
    }
    fetchEntries()
  }, [selectedDate])

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))
  }

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }))
  }

  const groupedEntries = entries.reduce((acc, entry) => {
    const year = entry.date.substring(0, 4)
    const month = entry.date.substring(0, 7)
    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    acc[year][month].push(entry)
    return acc
  }, {} as Record<string, Record<string, Entry[]>>)

  const selectedYear = selectedDate.substring(0, 4)
  const selectedMonth = selectedDate.substring(0, 7)
  
  if (!groupedEntries[selectedYear]) {
    groupedEntries[selectedYear] = {}
  }
  if (!groupedEntries[selectedYear][selectedMonth]) {
    groupedEntries[selectedYear][selectedMonth] = []
  }

  const sortedYears = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a))

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/40 h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Journal Entries</h2>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-2">
          {sortedYears.map((year) => (
            <div key={year} className="mb-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 font-medium hover:bg-gray-100"
                onClick={() => toggleYear(year)}
              >
                {expandedYears[year] ? 
                  <ChevronDown className="mr-1.5 h-4 w-4 text-gray-500" /> : 
                  <ChevronRight className="mr-1.5 h-4 w-4 text-gray-500" />}
                {year}
              </Button>
              
              {expandedYears[year] && (
                <div className="ml-2">
                  {Object.keys(groupedEntries[year])
                    .sort((a, b) => b.localeCompare(a))
                    .map((month) => (
                      <div key={month} className="mb-0.5">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-7 px-2 text-sm font-medium hover:bg-gray-100"
                          onClick={() => toggleMonth(month)}
                        >
                          {expandedMonths[month] ? 
                            <ChevronDown className="mr-1.5 h-3 w-3 text-gray-500" /> : 
                            <ChevronRight className="mr-1.5 h-3 w-3 text-gray-500" />}
                          {format(new Date(month), 'MMMM')}
                        </Button>
                        
                        {expandedMonths[month] && (
                          <div className="ml-3 space-y-0.5">
                            {[
                              ...(selectedDate.startsWith(month) && !groupedEntries[year][month].find(e => e.date === selectedDate) 
                                ? [{ date: selectedDate, content: '' }] 
                                : []),
                              ...groupedEntries[year][month]
                            ]
                              .sort((a, b) => b.date.localeCompare(a.date))
                              .map(entry => (
                                <Button
                                  key={entry.date}
                                  variant="ghost"
                                  className={`w-full justify-start px-2 py-1.5 h-auto hover:bg-gray-100 ${
                                    selectedDate === entry.date ? 'bg-gray-100 ring-1 ring-gray-200' : ''
                                  }`}
                                  onClick={() => onDateSelect(entry.date)}
                                >
                                  <div className="flex flex-col items-start w-full text-left">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">
                                        {format(new Date(entry.date), 'd')}
                                      </span>
                                      {isToday(new Date(entry.date)) && (
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                          Today
                                        </span>
                                      )}
                                    </div>
                                    {entry.content && (
                                      <p className="text-xs text-gray-500 truncate w-full max-w-[180px] text-left">
                                        {entry.content.substring(0, 30)}...
                                      </p>
                                    )}
                                  </div>
                                </Button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

export default Sidebar;