import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  inputHeight?: string;
  buttonHeight?: string;
  textSize?: string;
  iconSize?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search for AutoHotkey macros...",
  inputHeight = "h-24",
  buttonHeight = "h-24",
  textSize = "text-xl",
  iconSize = "h-7 w-7"
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 ${iconSize} text-muted-foreground pointer-events-none`} />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`pl-14 ${inputHeight} ${textSize} font-medium`}
          data-testid="input-search"
        />
      </div>
      <Button 
        onClick={onSearch}
        className={`${buttonHeight} px-8 ${textSize} font-bold`}
        data-testid="button-search"
      >
        Search
      </Button>
    </div>
  );
}