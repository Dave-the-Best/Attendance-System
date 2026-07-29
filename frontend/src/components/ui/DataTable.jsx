import { useMemo, useState } from 'react';
import { Search, ArrowUp, ArrowDown, ChevronsUpDown, Rows2, Rows3, Printer } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import EmptyState from './EmptyState';

// Reusable data grid: multi-column sort, density toggle, sticky header +
// optional sticky first column, print, live result count. Real <table>
// semantics with scope attributes. Filtering/search is owned by the parent
// (pass already-filtered `rows`); an optional search box calls `onSearch`.
export default function DataTable({
  columns,
  rows,
  rowKey,
  search,
  onSearch,
  searchPlaceholder,
  filters = null,
  actions = null,
  emptyIcon,
  emptyTitle,
  initialSort = null,
}) {
  const { t } = useLang();
  const [sort, setSort] = useState(initialSort); // { key, dir }
  const [dense, setDense] = useState(false);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = col.sortValue || ((r) => r[sort.key]);
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = val(a); const bv = val(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (!sort || sort.key !== col.key) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  return (
    <>
      <div className="toolbar">
        {onSearch && (
          <div className="field">
            <Search size={16} className="field-ico" />
            <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder || t('admin.searchPlaceholder')} aria-label={searchPlaceholder || t('admin.searchPlaceholder')} />
          </div>
        )}
        {filters}
        <div className="toolbar-sep" />
        <button
          className="chip-filter" type="button" onClick={() => setDense((d) => !d)}
          aria-pressed={dense} title={t('grid.density')}
        >
          {dense ? <Rows3 size={15} /> : <Rows2 size={15} />}
          {dense ? t('grid.comfortable') : t('grid.dense')}
        </button>
        <button className="chip-filter" type="button" onClick={() => window.print()} title={t('grid.print')}>
          <Printer size={15} /> {t('grid.print')}
        </button>
        {actions}
        <span className="result-count">{t('grid.showing')} {sorted.length}</span>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} hint={t('grid.noMatch')} />
      ) : (
        <div className="table-wrap">
          <table className={`table ${dense ? 'dense' : ''}`}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`${col.sortable ? 'sortable' : ''} ${col.sticky ? 'col-sticky' : ''}`}
                    style={col.align ? { textAlign: col.align } : undefined}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className="th-inner">{col.header}<SortIcon col={col} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.sticky ? 'col-sticky' : ''} style={col.align ? { textAlign: col.align } : undefined}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
