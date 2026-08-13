import React from 'react';
import styled from 'styled-components';
import Card from '../atoms/Card';
import { comma } from '../../utils/convert';
import Photo from '../atoms/Photo';

const staticServerUri = process.env.REACT_APP_PATH || "";

const ProductContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 12px;
`;

const ImageContainer = styled.div`
  
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Title = styled.div`
  text-decoration: none;
  display: inline-block;
  font-size: 0.95rem;
  line-height: 1.45;
  color: #333;
`;

const PriceText = styled.span`
  color: black;
  font-weight: bold;
  font-size: 1.15rem;
`;

const ProductCard = ({ product }) => {
  return (
    <ProductContainer to={`${staticServerUri}/products/${product.id}`}>
      <ImageContainer className="relative overflow-hidden rounded-xl">
        <Photo src={`${staticServerUri}/assets${product.image}`} alt={product.productName} className="aspect-[4/3] w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.02]" />
        <span className="absolute left-2 top-2 rounded-md bg-gray-900 px-2 py-1 text-xs font-bold text-yellow-300">
          톡딜
        </span>
      </ImageContainer>
      <div className="px-1 pb-1">
        <div className="mb-2 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-red-500">{product.discountRate}%</span>
          <span className="text-gray-400 line-through">{comma(product.originalPrice)}원</span>
        </div>
        <Title>{product.productName}</Title>
        <div className="h-1.5" />
        <PriceText>{comma(product.price)}원</PriceText>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            {product.freeShipping ? "무료배송" : "배송비 별도"}
          </span>
          <span aria-hidden="true">·</span>
          <span>리뷰 {comma(product.reviewCount)}</span>
        </div>
      </div>
    </ProductContainer>
  );
};

export default ProductCard;
