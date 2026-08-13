import React, { useEffect, useState } from "react";
import fallbackImage from "../../assets/image1.png";

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
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleError = (event) => {
    if (imageSrc === fallbackImage) {
      event.currentTarget.onerror = null;
      return;
    }
    setImageSrc(fallbackImage);
  };

  return (
    <picture className={`block w-full ${pictureClassName}`}>
      <source media="(min-width: 650px)" srcSet={imageSrc} />
      <img src={imageSrc} alt={alt} className={className} onError={handleError} />
    </picture>
  );
};

export default Photo;
