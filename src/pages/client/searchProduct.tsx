import React from "react";
import FilterSidebar from "../../components/FilterSidebar";
import ClientLayout from "../../layouts/clientLayout";


const SearchProduct = () => {
  return (
    <>
    <ClientLayout>
      <div className="flex flex-col md:flex-row px-4 md:px-16 py-6 mt-20">
        <FilterSidebar />
        <div className="w-full md:w-3/4 ml-8">
          <h2 className="text-xl font-semibold mb-6">Kết quả tìm kiếm theo 'Đầm'</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          </div>
        </div>
      </div>
    </ClientLayout>
     </>
  );
};

export default SearchProduct;
