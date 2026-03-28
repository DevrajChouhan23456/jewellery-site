"use client";

import { type FormEvent } from "react";
import { Camera, Mic, Search } from "lucide-react";

type SearchBarProps = {
  variant: "desktop" | "mobile";
  query: string;
  placeholder: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const SearchBar = ({
  variant,
  query,
  placeholder,
  onQueryChange,
  onSubmit,
}: SearchBarProps) => {
  if (variant === "mobile") {
    return (
      <form onSubmit={onSubmit}>
        <div className="relative flex items-center h-10 rounded-full border border-gray-300 px-3">
          <Search className="size-4 text-gray-400 mr-2" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="hidden flex-1 max-w-[600px] md:block"
    >
      <div className="relative flex items-center w-full h-11 rounded-full border border-gray-300 bg-white px-4 hover:border-gray-400 transition-colors focus-within:border-[#832729] focus-within:ring-1 focus-within:ring-[#832729]">
        <Search className="size-4 text-gray-400 mr-2" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <div className="flex items-center gap-3 text-gray-400">
          <Camera className="size-4 cursor-pointer hover:text-[#832729]" />
          <Mic className="size-4 cursor-pointer hover:text-[#832729]" />
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
