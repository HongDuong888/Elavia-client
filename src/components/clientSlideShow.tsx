import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "/node_modules/swiper/swiper-bundle.min.css";
import { Autoplay } from "swiper/modules";

type SlideshowProps = {
  images: string[];
  spaceBetween?: number;
  slidesPerView?: number;
  autoplayDelay?: number;
};

const Slideshow: React.FC<SlideshowProps> = ({
  images,
  spaceBetween = 50,
  slidesPerView = 1,
  autoplayDelay = 2500,
}) => {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      autoplay={{
        delay: autoplayDelay,
        disableOnInteraction: false,
      }}
      loop={true}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            className="rounded-tl-[80px] rounded-br-[80px]"
            src={image}
            alt={`Image ${index + 1}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
const SlideshowTwo: React.FC<SlideshowProps> = ({
  images,
  spaceBetween = 50,
  slidesPerView = 1,
  autoplayDelay = 2500,
}) => {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      autoplay={{
        delay: autoplayDelay,
        disableOnInteraction: false,
      }}
      loop={true}
      breakpoints={{
        320: { slidesPerView: 1 },
        480: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 2 },
        1280: { slidesPerView: 2 },
      }}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            className="rounded-tl-[80px] rounded-br-[80px]"
            src={image}
            alt={`Image ${index + 1}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export { Slideshow, SlideshowTwo };
