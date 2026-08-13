import React from 'react';
import ProductCard from '../molecules/ProductCard';

const ProductGrid = ({ products = [] }) => {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 px-4 pb-8 pt-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
