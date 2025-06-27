import ClientFooterDongHanh from "../../layouts/clientFooter-Dong-Hanh";
import ClientLayout from "../../layouts/clientLayout";

const ReturnPolicy = () => {
  return (
    <>
      <ClientLayout>
        <div className="flex gap-4 my-4 mt-[98px]">
          <div className="text-sm">
            <a href="/">Trang chủ</a>
          </div>
          <div className="text-sm">-</div>
          <div className="text-sm">Chính sách đổi trả</div>
        </div>
        <hr className="mb-8" />
        <article>
          <div>
            <div className="grid grid-cols-[1fr_2fr] gap-10 justify-center">
              <div className="border border-gray-400 rounded-tl-[40px] rounded-br-[40px] h-80">
                <p className="p-12">
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Về ELA via
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Chính sách thẻ thành viên
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Bảo hành trọn đời
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Chính sách đổi trả
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Hệ thống cửa hàng
                  </a>
                  <br />
                  <a
                    className="leading-[15px] text-[14px] font-semibold text-gray-600 block hover:text-black"
                    href=""
                  >
                    Q&A
                  </a>
                  <br />
                </p>
              </div>
              <div>
                <div className="mb-8">
                  <div className="text-[24px] font-semibold mt-0 mr-0 mb-[10px] ml-0">
                    CHÍNH SÁCH ĐỔI HÀNG
                  </div>
                  <br />
                  <div className="text-[16px] font-bold mt-0 mr-0 mb-[10px] ml-0 mx-auto">
                    1. THỜI GIAN ĐỔI TRẢ
                  </div>
                  <br />
                  <div className="space-y-0.25 text-[16px]">
                    <div>
                      Thời gian đổi trả trong vòng 15 ngày kể từ ngày khách nhận
                      được hàng.
                    </div>
                    <br />
                    <div className="font-semibold">2. ĐỊA ĐIỂM ĐỔI HÀNG</div>
                    <br />
                    <div className="font-normal text-base">
                      Áp dụng tại tất cả các cửa hàng trên toàn hệ thống của IVY
                      moda và{" "}
                      <span className="font-">
                        Hệ thống Kho hàng Online của ELA via.
                      </span>
                    </div>
                    <br />
                    <div className="font-semibold">3. ĐIỀU KIỆN ĐỔI TRẢ</div>
                    <br />
                    <div className="font-normal text-base">
                      - Hàng đổi phải còn nguyên nhãn mác, mã vạch, chưa qua sử
                      dụng và có hóa đơn mua hàng nguyên vẹn kèm theo (bao gồm
                      cả các sản phẩm chất liệu thun/len/thun len, jeans).
                    </div>
                    <br />
                    <div className="font-normal text-base">
                      - Với các trường hợp đổi trả không có hóa đơn, Quý khách
                      vui lòng quay lại showroom đã mua hàng để được hỗ trợ.
                    </div>
                    <br />
                    <div>
                      - Đơn hàng chỉ được đổi 01 lần theo đúng quy định.
                    </div>
                    <br />
                    <div>
                      - Giá trị sản phẩm đổi/trả được tính theo đơn giá trên hóa
                      đơn mua hàng.
                    </div>
                    <br />
                    <div>
                      - ELA via chỉ sử dụng “Biên lai đặt cọc” để hoàn lại tiền
                      thừa sau khi đổi và giá trị hàng trả cho khách, không hoàn
                      tiền mặt trong mọi trường hợp.
                    </div>
                    <br />
                    <div>
                      - Nếu lỗi do nhà sản xuất, IVY sẽ chịu hoàn toàn phí ship
                      đổi trả sản phẩm
                    </div>
                    <br />
                    <div className="font-semibold">
                      4. CÁC TRƯỜNG HỢP TỪ CHỐI ĐỔI TRẢ
                    </div>
                    <br />
                    <div>
                      - Sản phẩm nằm trong chương trình đồng giá, giảm giá trên
                      50%
                    </div>
                    <br />
                    <div>- Thời gian mua hàng quá 15 ngày.</div>
                    <br />
                    <div>- Nhãn mác, mã vạch không còn nguyên vẹn.</div>
                    <br />
                    <div>
                      - Sản phẩm đã chỉnh sửa, đã qua sử dụng (bị bẩn, rách,
                      hỏng, rút sợi, phai màu, có mùi hôi, mùi hóa chất khác
                      thường) hoặc bị lỗi do những tác động bên ngoài sau khi
                      mua, hoặc các phụ kiện/chi tiết gắn liền của sản phẩm
                      không còn đầy đủ/hư hại.
                    </div>
                    <br />
                    <div>
                      - Sản phẩm mang nhãn IVY Secret, áo quây, áo 2 dây, các
                      loại phụ kiện (túi xách, giày, thắt lưng…)…
                    </div>
                    <br />
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

export default ReturnPolicy;
