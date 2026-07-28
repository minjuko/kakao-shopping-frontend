import React from "react";

/**
 *
 * @param {Object} props - 이미지 컴포넌트의 속성
 * @param {string} props.className - 컴포넌트에 적용될 CSS 클래스 이름
 * @param {string} props.src - 이미지 URL =
 * @param {string} props.alt - 이미지 대체 텍스트
 *
 * @returns {JSX.Element} - Photo Component
 */
const Photo = ({ className, pictureClassName = "", src, alt }) => {
  return (
    <picture className={`block w-full ${pictureClassName}`}>
      <source media="(min-width: 650px)" srcSet={src} />
      <img src={src} alt={alt} className={className} />
    </picture>
  );
};

export default Photo;
