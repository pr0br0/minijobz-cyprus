"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CYPRUS_CITIES, 
  POPULAR_CITIES, 
  DISTRICTS, 
  CyprusCity,
  getDistrictByCity 
} from "@/lib/constants/cities";

interface CitySelectorProps {
  value: CyprusCity | "";
  onValueChange: (value: CyprusCity) => void;
  placeholder?: string;
  className?: string;
  showPopular?: boolean;
  showDistricts?: boolean;
  disabled?: boolean;
}

export default function CitySelector({
  value,
  onValueChange,
  placeholder = "Select city...",
  className,
  showPopular = true,
  showDistricts = true,
  disabled = false,
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);

  const currentDistrict = value ? getDistrictByCity(value) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {value ? (
                <span className="truncate">{value}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search cities..." />
            <CommandList>
              <CommandEmpty>No city found.</CommandEmpty>
              
              {/* Popular Cities Section */}
              {showPopular && (
                <>
                  <CommandGroup heading="Popular Cities">
                    {POPULAR_CITIES.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          onValueChange(city);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === city ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2">
                          <span>{city}</span>
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Districts Section */}
              {showDistricts && (
                <>
                  {Object.entries(DISTRICTS).map(([districtName, cities]) => (
                    <CommandGroup key={districtName} heading={districtName}>
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => {
                            onValueChange(city);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === city ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <span>{city}</span>
                            {value === city && currentDistrict && (
                              <Badge variant="outline" className="text-xs">
                                {currentDistrict}
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                  <CommandSeparator />
                </>
              )}

              {/* All Cities Section */}
              <CommandGroup heading="All Cities">
                {CYPRUS_CITIES.filter(city => 
                  !POPULAR_CITIES.includes(city as any) &&
                  !Object.values(DISTRICTS).flat().includes(city as any)
                ).map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onValueChange(city);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected City Display */}
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Selected: {value}</span>
          {currentDistrict && (
            <Badge variant="outline" className="text-xs">
              {currentDistrict}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}