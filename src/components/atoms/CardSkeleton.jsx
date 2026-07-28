import React from 'react';

const CardLoader = () => {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-6" aria-label="상품을 불러오는 중">
      {new Array(6).fill('').map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-3">
          <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
          <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
          <div className="mt-3 h-6 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
};

export default CardLoader;
