
interface SearchBarProps {
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar = ({ showSearch, searchTerm, setSearchTerm }: SearchBarProps) => {
  if (!showSearch) return null;

  return (
    <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-orange-100 dark:from-pink-900 dark:via-purple-900 dark:to-orange-900 p-3 border-b">
      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:from-pink-500 focus:to-orange-500 dark:bg-gray-700 dark:text-white"
        autoFocus
      />
    </div>
  );
};

export default SearchBar;
