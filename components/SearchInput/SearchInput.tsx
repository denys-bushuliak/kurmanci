import React, { ChangeEvent } from 'react';
import { useRequest } from 'ahooks';
import Link from '@docusaurus/Link';
import data from '../../docs/result.json';
import './style.css';

async function getResults(search: string): Promise<typeof data> {
  const query = search.toLowerCase().trim();

  return new Promise((resolve) => {
    const results = data.filter((page) => 
      page.body.toLowerCase().includes(query) ||
      page.title.toLowerCase().includes(query)
    );
    resolve(results || []);
  });
}

export function SearchInput() {
  const { data, run } = useRequest(getResults, {
    debounceInterval: 700,
    manual: true,
  });

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 1) {
      run(e.target.value);
    }
  }

  return (
    <div className="search">
      <input
        onChange={handleSearch}
        placeholder="Введите сюда слово для поиска"
      />
      <dl>
        {data?.length > 0 &&
          data?.map((v, idx) => {
            return (
              <React.Fragment key={idx}>
                <dt>
                  <Link className="result" to={v.url}>
                    {v.title}
                  </Link>
                </dt>
              </React.Fragment>
            );
          })}
        {data && data?.length == 0 && 'Нет результатов'}
      </dl>
    </div>
  );
}
