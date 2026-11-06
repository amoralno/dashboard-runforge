interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <>
    <label className="sr-only" htmlFor="run-search">Поиск по названию запуска или репозиторию</label>
    <input
      id="run-search"
      type="search"
      className="search-input"
      placeholder="Поиск по названию или репозиторию..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </>
);
