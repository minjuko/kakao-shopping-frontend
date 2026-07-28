import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import image1 from "../../assets/carouselItem1.jpeg";
import image2 from "../../assets/carouselItem2.jpeg";
import image3 from "../../assets/carouselItem3.jpeg";

const MyCarousel = () => {
  return (
    <section
      className="mx-auto w-full max-w-[1200px] px-4 pt-4 sm:px-6"
      aria-label="추천 상품 배너"
    >
      <div className="overflow-hidden rounded-2xl">
        <Carousel showArrows={true} showThumbs={false} autoPlay={true} infiniteLoop={true}>
          <div>
            <img src={image1} alt="카카오 쇼핑 추천 상품 1" />
          </div>
          <div>
            <img src={image2} alt="카카오 쇼핑 추천 상품 2" />
          </div>
          <div>
            <img src={image3} alt="카카오 쇼핑 추천 상품 3" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default MyCarousel;
