import ClientFooterDongHanh from "../../layouts/clientFooter-Dong-Hanh";
import ClientLayout from "../../layouts/clientLayout";

const BuyingGuide = () => {
  return (
    <>
      <ClientLayout>
        <div className="flex gap-4 my-4 mt-[98px]">
          <div className="text-sm">
            <a href="?action=home">Trang chủ</a>
          </div>
          <div className="text-sm">-</div>
          <div className="text-sm">Hướng dẫn mua hàng</div>
        </div>
        <hr className="mb-8" />
        <div className="mt-[10px] flex">
          <img
            src="/images/huong_dan_mua_hang1.jpg"
            alt="Hướng dẫn mua hàng 1"
          />
        </div>
        <hr className="mb-[30px]" />

        <article>
          <div>
            <div className="grid grid-cols-[1fr_2fr] gap-10 justify-center">
              <div className="border border-gray-400 rounded-tl-[40px] rounded-br-[40px] h-80">
                <p className="p-12">
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Về ELA via
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Chính sách thẻ thành viên
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Bảo hành trọn đời
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Chính sách đổi trả
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Hệ thống cửa hàng
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href="#"
                  >
                    Q&A
                  </a>
                  <br />
                </p>
              </div>
              <div>
                <div className="mb-8">
                  <div className="text-2xl font-semibold">
                    HƯỚNG DẪN MUA HÀNG
                  </div>
                  <br />
                  <div className="text-lg font-semibold">
                    Mua sắm tại ELA via thật dễ dàng. Quý khách chỉ cần làm theo
                    các bước sau:
                  </div>
                  <br />
                  <div className="space-y-1.5 ml-[24px] text-[#000000] text-[16px]">
                    <div className="font-normal text-base">
                      Bước 1: Chọn dòng sản phẩm (Nam/ Nữ/ Sale) rồi chọn chủng
                      loại sản phẩm (áo sơ mi, áo thun, đầm,..)
                    </div>
                    <div className="font-normal text-base">
                      Bước 2: Xem sản phẩm quý khách quan tâm rồi nhấp vào ảnh
                      để phóng to và xem mọi chi tiết, kích cỡ hiện có, thành
                      phần, mã tham chiếu và giá.
                    </div>
                    <div className="font-normal text-base">
                      Bước 3: Chọn mặt hàng và thêm mặt hàng vào giỏ. Sau đó,
                      quý khách có thể chọn tiếp tục mua sắm hoặc xử lý đơn
                      hàng.
                    </div>
                    <div className="font-normal text-base">
                      Bước 4: Nếu muốn xử lý đơn hàng, quý khách có thể thực
                      hiện bằng cách đăng ký hoặc thanh toán với tư cách khách
                      hàng mới.
                    </div>
                    <div className="font-normal text-base">
                      Bước 5: Chọn phương thức giao hàng.
                    </div>
                    <div className="font-normal text-base">
                      Bước 6: Chọn phương thức thanh toán.
                    </div>
                    <div className="font-normal text-base">
                      Bước 7: Xác nhận đơn hàng: Quý khách sẽ nhận được email
                      xác nhận đơn hàng.
                    </div>
                    <div className="font-normal text-base">
                      ELA via sẽ gửi Thông tin xác nhận đặt hàng thành công qua
                      Tin nhắn vào số điện thoại đặt hàng và Email qua địa chỉ
                      email của quý khách.
                    </div>
                    <div className="font-semibold text-base">
                      Trong trường hợp quý khách muốn thay đổi địa chỉ giao
                      hàng, số điện thoại hoặc thông tin người nhận cho đơn hàng
                      đã đặt thì:
                    </div>
                    <div className="font-normal text-base">
                      TH1: Nếu đơn hàng chưa được ELA via xử lý, bạn chỉ cần làm
                      các bước sau:
                    </div>
                    <div className="font-normal text-base">
                      Bước 1: Vào đường link:{" "}
                      <a href="https://ivymoda.com/page/order_find">
                        https://ivymoda.com/page/order_find
                      </a>
                    </div>
                    <div className="font-normal text-base">
                      Bước 2: Điền Mã đơn hàng và Số điện thoại đặt đơn
                    </div>
                    <div className="font-semibold text-base">
                      Bước 3: Bấm vào: Huỷ đơn
                    </div>
                    <div className="font-semibold text-base">
                      Bước 4: Đặt lại đơn hàng mới
                    </div>
                    <div className="font-semibold text-base">
                      TH2: Nếu đơn hàng đã được ELA via xử lý thì bạn liên hệ
                      đến: Hotline: 02466623434 - nhánh 2 để được hỗ trợ
                    </div>
                    <div className="font-normal text-base">
                      ELA via rất vui vì được quý khách tin yêu!
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ClientFooterDongHanh />
          </div>
        </article>
      </ClientLayout>
    </>
  );
};

export default BuyingGuide;
