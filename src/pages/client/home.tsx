import { useQuery } from "@tanstack/react-query";
import { Slideshow, SlideshowTwo } from "../../components/clientSlideShow";
import ProductItemVariantForm from "../../components/productItemVariant";
import ClientLayout from "../../layouts/clientLayout";
import { getList } from "../../api/provider";
import React, { useState } from "react";
import { title } from "process";

const Home = () => {
  // Sử dụng hook useQuery đúng chuẩn
  const { data, isLoading, error } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getList({ namespace: "site-settings" }),
    staleTime: 5 * 60 * 1000,
  });

  // getList trả về mảng, lấy phần tử đầu tiên
  const siteSettings = Array.isArray(data) ? data[0] : data;

  // Thêm state để điều khiển tab
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [activeCollectionTab, setActiveCollectionTab] = useState<"women" | "men">("women");

  // Xác định namespace theo tab
  const newArrivalNamespace =
    activeTab === "women"
      ? "product-variants/new-arrival/women"
      : "product-variants/new-arrival/men";

  const collectionNamespace =
    activeCollectionTab === "women"
      ? "product-variants/bestsellingProducts/women"
      : "product-variants/bestsellingProducts/men";

  if (error) return <div>Lỗi tải dữ liệu: {error.message}</div>;
  if (isLoading) return <div>Đang tải...</div>;

  const banner01 =
    siteSettings?.banners?.banner01?.map((img: any) => img.url) || [];
  const banner02 =
    siteSettings?.banners?.banner02?.map?.((img: any) => img.url) ||
    (siteSettings?.banners?.banner02?.url
      ? [siteSettings.banners.banner02.url]
      : []);
  const banner03 =
    siteSettings?.banners?.banner03?.map((img: any) => img.url) || [];

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
            <Slideshow images={banner01} autoplayDelay={2000} />
          </div>

          {/* NEW ARRIVAL Section */}
          <p className="text-center font-semibold text-xl sm:text-2xl md:text-3xl pt-8 md:pt-10">
            SẢN PHẨM MỚI
          </p>
          <div className="flex justify-center pb-6 md:pb-8 pt-2 md:pt-4">
            <button
              className={`pr-3 md:pr-6 text-lg md:text-xl ${activeTab === "women" ? "font-bold text-black underline" : "text-gray-500"
                }`}
              onClick={() => setActiveTab("women")}
            >
              ELA NỮ
            </button>
            <button
              className={`pl-3 md:pl-6 text-lg md:text-xl ${activeTab === "men" ? "font-bold text-black underline" : "text-gray-500"
                }`}
              onClick={() => setActiveTab("men")}
            >
              ELA NAM
            </button>
          </div>

          {/* Product Items */}
          <div className="w-full">
            <ProductItemVariantForm namespace={newArrivalNamespace} />
          </div>

          {/* View All Button */}
          <div
            className="p-2 sm:p-3 border border-black text-center w-28 sm:w-32 h-10 sm:h-12 mx-auto rounded-tl-[25px] rounded-br-[25px] mb-8 sm:mb-12 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center"
            onClick={() => {
              window.location.href = `/new-arrival/${activeTab}`;
            }}
          >
            <span className="text-sm sm:text-base">Xem tất cả</span>
          </div>

          {/* FALL - WINTER COLLECTION Section */}
          {/* FALL - WINTER COLLECTION Section */}
          <p className="text-center font-semibold text-xl sm:text-2xl md:text-3xl pb-1 sm:pb-2">
            SẢN PHẨM BÁN CHẠY
          </p>
          <div className="flex justify-center pb-6 md:pb-8">
            <button
              className={`pr-3 md:pr-6 text-lg md:text-xl ${activeCollectionTab === "women" ? "font-bold text-black underline" : "text-gray-500"
                }`}
              onClick={() => setActiveCollectionTab("women")}
            >
              ELA NỮ
            </button>
            <button
              className={`pl-3 md:pl-6 text-lg md:text-xl ${activeCollectionTab === "men" ? "font-bold text-black underline" : "text-gray-500"
                }`}
              onClick={() => setActiveCollectionTab("men")}
            >
              ELA NAM
            </button>
          </div>

          <div className="w-full">
            <ProductItemVariantForm namespace={collectionNamespace} />
          </div>

          <div
            className="p-2 sm:p-3 border border-black text-center w-28 sm:w-32 h-10 sm:h-12 mx-auto rounded-tl-[25px] rounded-br-[25px] mb-8 sm:mb-12 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center"
            onClick={() => {
              window.location.href = `/bestsellingProducts/${activeCollectionTab}`;
            }}
          >
            <span className="text-sm sm:text-base">Xem tất cả</span>
          </div>

          {/* Banner đơn động */}
          <div className="w-full mb-4">
            <img
              className="w-full rounded-tl-[40px] sm:rounded-tl-[60px] md:rounded-tl-[80px] rounded-br-[40px] sm:rounded-br-[60px] md:rounded-br-[80px]"
              src={banner02}
              alt="Spring-Summer Collection Banner"
            />
          </div>

          {/* Banner phụ động */}
          <div className="w-full overflow-hidden py-4">
            <SlideshowTwo images={banner03} slidesPerView={2} autoplayDelay={2000} />
          </div>
        </article>
      </ClientLayout>
    </>
  );
};

export default Home;
