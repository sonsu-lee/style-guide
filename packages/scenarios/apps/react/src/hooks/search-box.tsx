import { useCallback, useEffect, useMemo, useState } from 'react';

interface SearchBoxProps {
  query: string;
  titles: string[];
  openSearch: (query: string) => void;
  syncSearchQuery: (query: string) => void;
}

export function StaleSearchBox({ query, titles, openSearch, syncSearchQuery }: SearchBoxProps) {
  // expect: warning react-hooks(exhaustive-deps) -- The suggestions stay filtered by the old query.
  const matches = useMemo(() => titles.filter((title) => title.startsWith(query)), [titles]);
  // expect: warning react-hooks(exhaustive-deps) -- The submit button opens results for the old query.
  const submitSearch = useCallback(() => openSearch(query), [openSearch]);
  // effect: Keep the external search widget synchronized with the current query.
  // expect: warning react-hooks(exhaustive-deps) -- The widget does not see query changes.
  useEffect(() => syncSearchQuery(query), [syncSearchQuery]);

  return <button onClick={submitSearch}>Search {matches.length} matching products</button>;
}

export function SearchBox({ query, titles, openSearch, syncSearchQuery }: SearchBoxProps) {
  const normalizedQuery = query.trim();
  const matches = useMemo(
    () => titles.filter((title) => title.startsWith(normalizedQuery)),
    [titles, normalizedQuery],
  );
  const submitSearch = useCallback(
    () => openSearch(normalizedQuery),
    [openSearch, normalizedQuery],
  );
  // effect: Keep the external search widget synchronized with the current query.
  useEffect(() => syncSearchQuery(normalizedQuery), [syncSearchQuery, normalizedQuery]);

  return <button onClick={submitSearch}>Search {matches.length} matching products</button>;
}

export function ConditionalSearchDraft({ visible, query }: { visible: boolean; query: string }) {
  if (visible) {
    // expect: error react-hooks(rules-of-hooks) -- Toggling the draft changes the hook order.
    const [draft] = useState(query);
    return <output>{draft}</output>;
  }
  return null;
}

export function EffectSearchDraft({ query }: { query: string }) {
  const [draft, setDraft] = useState('');
  // effect: Keep the draft aligned with the normalized query.
  useEffect(() => {
    // expect: error react(set-state-in-effect) -- Copying props to state takes an extra render.
    setDraft(query.trim());
  }, [query]);
  return <output>{draft}</output>;
}

export function RenderSearchDraft({ query }: { query: string }) {
  const [draft, setDraft] = useState('');
  // expect: error react(set-state-in-render) -- Updating the draft during render keeps rendering it again.
  setDraft(query.trim());
  return <output>{draft}</output>;
}
