import { Slideshow, SlideshowTwo } from "../../components/clientSlideShow";
import ProductItemForm from "../../components/productItem";
import ClientLayout from "../../layouts/clientLayout";

const Slideshow1 = () => {
  const images1 = [
    "/images/banner1.webp",
    "/images/banner1.2.webp",
    "/images/banner1.3.webp",
  ];

  return <Slideshow images={images1} autoplayDelay={2000} />;
};

const Slideshow2 = () => {
  const images3 = [
    "/images/banner2.1.webp",
    "/images/banner2.2.webp",
    "/images/banner2.3.webp",
  ];
  return (
    <SlideshowTwo images={images3} slidesPerView={2} autoplayDelay={2000} />
  );
};
const Home = () => {
  return (
    <>
      <ClientLayout>
        <article className="mt-[82px]">
          {/* Promo banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-center pb-6 gap-2 sm:gap-0">
            <div className="bg-[#D73831] text-[12px] sm:text-[14px] text-white py-1 px-2 font-semibold text-center">
              SALE OFF 50%
            </div>
            <div className="bg-[#DC633A] text-[12px] sm:text-[14px] text-white py-1 px-2 font-semibold text-center">
              SALE OFF 30%
            </div>
            <div className="bg-[#AC2F33] text-[12px] sm:text-[14px] text-white py-1 px-2 font-semibold text-center">
              LAST SALE FROM 100K
            </div>
          </div>

          {/* Main Banner Slideshow */}
          <div className="w-full overflow-hidden">
            <Slideshow1 />
          </div>

          {/* NEW ARRIVAL Section */}
          <p className="text-center font-semibold text-xl sm:text-2xl md:text-3xl pt-8 md:pt-10">
            NEW ARRIVAL
          </p>
          <div className="flex justify-center pb-6 md:pb-8 pt-2 md:pt-4">
            <p className="pr-3 md:pr-6 text-lg md:text-xl underline">ELA via</p>
            <p className="pl-3 md:pl-6 text-lg md:text-xl text-gray-500">
              Elavia men
            </p>
          </div>

          {/* Product Items */}
          <div className="w-full">
            <ProductItemForm namespace="" />
          </div>

          {/* View All Button */}
          <div className="p-2 sm:p-3 border border-black text-center w-28 sm:w-32 h-10 sm:h-12 mx-auto rounded-tl-[25px] rounded-br-[25px] mb-8 sm:mb-12 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center">
            <span className="text-sm sm:text-base">Xem tất cả</span>
          </div>

          {/* FALL - WINTER COLLECTION Section */}
          <p className="text-center font-semibold text-xl sm:text-2xl md:text-3xl pb-1 sm:pb-2">
            FALL - WINTER COLLECTION 2024
          </p>
          <div className="flex justify-center pb-6 md:pb-8">
            <p className="pr-3 md:pr-6 text-lg md:text-xl underline">ELA via</p>
            <p className="pl-3 md:pl-6 text-lg md:text-xl text-gray-500">
              ELA via
            </p>
          </div>

          {/* Product Items for Collection */}
          <div className="w-full">
            <ProductItemForm namespace="" />
          </div>

          {/* View All Button */}
          <div className="p-2 sm:p-3 border border-black text-center w-28 sm:w-32 h-10 sm:h-12 mx-auto rounded-tl-[25px] rounded-br-[25px] mb-8 sm:mb-12 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center">
            <span className="text-sm sm:text-base">Xem tất cả</span>
          </div>

          {/* Large Banner Image */}
          <div className="w-full mb-4">
            <img
              className="w-full rounded-tl-[40px] sm:rounded-tl-[60px] md:rounded-tl-[80px] rounded-br-[40px] sm:rounded-br-[60px] md:rounded-br-[80px]"
              src="/images/banner1.4.webp"
              alt="Fall-Winter Collection Banner"
            />
          </div>

          {/* Secondary Slideshow */}
          <div className="w-full overflow-hidden py-4">
            <Slideshow2 />
          </div>
        </article>
      </ClientLayout>
    </>
  );
};

export default Home;
