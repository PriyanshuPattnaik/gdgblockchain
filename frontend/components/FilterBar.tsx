import { ELEMENTS, RARITIES } from "@/lib/types";

export type MarketFilters = {
  query: string;
  rarity: string;
  element: string;
  sort: "price-asc" | "price-desc" | "id-desc";
};

export function FilterBar({
  value,
  onChange,
  listedCount,
}: {
  value: MarketFilters;
  onChange: (next: MarketFilters) => void;
  listedCount: number;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
      <input
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
        className="field lg:max-w-xs"
        placeholder="Search name or token id"
      />
      <select
        value={value.rarity}
        onChange={(e) => onChange({ ...value, rarity: e.target.value })}
        className="field lg:max-w-[10rem]"
      >
        <option value="">All rarities</option>
        {RARITIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={value.element}
        onChange={(e) => onChange({ ...value, element: e.target.value })}
        className="field lg:max-w-[10rem]"
      >
        <option value="">All elements</option>
        {ELEMENTS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={value.sort}
        onChange={(e) => onChange({ ...value, sort: e.target.value as MarketFilters["sort"] })}
        className="field lg:max-w-[11rem]"
      >
        <option value="id-desc">Newest mint</option>
        <option value="price-asc">Price: low</option>
        <option value="price-desc">Price: high</option>
      </select>
      <p className="text-sm text-mute lg:ml-auto">{listedCount} for sale</p>
    </div>
  );
}
