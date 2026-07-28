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
  row-gap: 16px;
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
      <ImageContainer>
        <Photo src={`${staticServerUri}/assets${product.image}`} alt={product.productName} className="aspect-[4/3] w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.02]" />
      </ImageContainer>
      <div className="px-1 pb-1">
        <Title>{product.productName}</Title>
        <div className="h-2" />
        <PriceText>{comma(product.price)}원</PriceText>
        
      </div>
    </ProductContainer>
  );
};

export default ProductCard;
