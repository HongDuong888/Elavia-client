import ClientFooterDongHanh from "../../layouts/clientFooter-Dong-Hanh";
import ClientLayout from "../../layouts/clientLayout";

const PaymentPolicy = () => {
  return (
    <>
      <ClientLayout>
        <div className="flex gap-4 my-4 mt-[98px]">
          <div className="text-sm">
            <a href="/">Trang chủ</a>
          </div>
          <div className="text-sm">-</div>
          <div className="text-sm">Chính sách thanh toán</div>
        </div>
        <hr className="mb-8" />
        <div className="mb-8">
          <img src="/images/banner_thanh_toan.jpg" alt="" />
        </div>
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
                  <div className="text-2xl font-semibold m-0 mb-7 text-[#221F20]">
                    CHÍNH SÁCH THANH TOÁN
                  </div>
                  <br />
                  <div className="text-[20px] font-bold mt-0 mr-0 mb-[10px] ml-0 mx-auto">
                    Có 2 hình thức thanh toán khi mua hàng online tại ELA via
                  </div>
                  <br />
                  <div className="space-y-1 text-[16px]">
                    <div className="text-[#6C6D70] m-0 mb-[1px]">
                      Hình thức thu tiền tận nơi (COD): Khách hàng sẽ thanh toán
                      tiền khi nhận hàng và thanh toán tiền hàng và cước phí vận
                      chuyển cho nhân viên chuyển phát. <br />
                      Thanh toán trực tuyến OnePay qua thẻ ATM nội địa hoặc thẻ
                      quốc tế trực tiếp tại website.
                    </div>
                    <br />
                    <div className="font-semibold text-[#221F20] text-[20px]">
                      Question and answer
                    </div>
                    <br />
                    <div className="font-semibold text-[#221F20] text-[20px]">
                      Tại sao thẻ tín dụng của tôi có thể bị từ chối?
                    </div>
                    <br />
                    <div className="font-normal text-[#6C6D70] text-base">
                      Thẻ tín dụng của quý khách có thể bị từ chối vì bất kỳ lý
                      do nào sau đây:
                    </div>
                    <br />
                    <div className="font-normal text-[#6C6D70] text-base">
                      - Thẻ có thể đã hết hạn. Kiểm tra xem thẻ của quý khách
                      còn hiệu lực không. <br />
                      - Quý khách có thể đã đạt đến hạn mức tín dụng. Liên hệ
                      với ngân hàng để kiểm tra xem quý khách có vượt quá giới
                      hạn mua hàng được ủy quyền không. <br />- Quý khách có thể
                      đã nhập thông tin nào đó không chính xác. Kiểm tra xem quý
                      khách đã điền đúng tất cả các trường bắt buộc chưa.
                    </div>
                    <br />
                    <div className="text-base font-semibold">
                      Tôi có thể đưa thông tin chi tiết của công ty mình vào hóa
                      đơn không?
                    </div>
                    <br />
                    <div className="font-normal text-[#6C6D70] text-base">
                      - Có. Chỉ cần nhấp vào tùy chọn doanh nghiệp trong thông
                      tin chi tiết cá nhân rồi điền thông tin thuế mà chúng tôi
                      yêu cầu.
                    </div>
                    <br />
                    <div className="text-base font-semibold">
                      Có an toàn khi sử dụng thẻ tín dụng của tôi trên trang web
                      không?
                    </div>
                    <br />
                    <div className="font-normal text-[#6C6D70] text-base">
                      - Đúng, các dữ liệu được truyền đi bằng cách mã hóa theo
                      giao thức SSL. Đối với việc thanh toán bằng thẻ tín dụng
                      và thẻ ghi nợ, yêu cầu phải nhập số CVV (Card Verification
                      Value, Mã Xác thực Thẻ), là mã số in trên thẻ được sử dụng
                      như một biện pháp bảo mật trong các giao dịch thương mại
                      điện tử.
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

export default PaymentPolicy;
