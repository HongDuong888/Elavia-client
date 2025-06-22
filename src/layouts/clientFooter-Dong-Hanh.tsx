const ClientFooterDongHanh = () => {
  return (
    <div className="grid grid-cols-[1.75fr_1.25fr] gap-10 justify-center mb-10">
      <div>
        <img src="/images/huong_dan_mua_hang2.jpg" alt="Hướng dẫn mua hàng 2" />
      </div>
      <div className="p-8">
        <div className="text-3xl font-semibold">Đồng hành cùng Ela Via</div>
        <br />
        <div className="text-[16px] text-[#6C6D70]">
          Cảm ơn bạn đã yêu thích sản phẩm và đồng hành cùng Ela Via. Mọi thắc
          mắc liên quan đến chính sách thanh toán, vui lòng liên hệ theo số
          thông tin bên dưới
        </div>
        <br />
        <div className="">
          <a
            className="bg-black w-68 h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center lg:text-[16px] md:text-[12px] text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer transition-all duration-300"
            href="tel:0548569879"
          >
            GỌI NGAY: 0548 569 879
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientFooterDongHanh;
