const CATEGORIES = [
  'Customer Baseline',
  'Feature Adoption',
  'Outcome Adoption',
  'QBR Preparation',
  'Product Name/General',
]

export default function Filters({
  category,
  productContext,
  sortByVotes,
  onCategoryChange,
  onProductChange,
  onSortChange,
  productOptions = [],
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div>
        <label htmlFor="filter-category" className="block text-sm font-medium text-slate-700 mb-1">
          Category
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-product" className="block text-sm font-medium text-slate-700 mb-1">
          Product
        </label>
        <select
          id="filter-product"
          value={productContext}
          onChange={(e) => onProductChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
        >
          <option value="">All</option>
          {productOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="sort-votes"
          type="checkbox"
          checked={sortByVotes}
          onChange={(e) => onSortChange(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="sort-votes" className="text-sm text-slate-700">
          Sort by Thumbs Up
        </label>
      </div>
    </div>
  )
}
