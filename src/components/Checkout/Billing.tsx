import React from "react";

const Billing = ({ setShippingAddress }: { setShippingAddress: (val: string) => void }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Gộp các trường địa chỉ lại thành 1 chuỗi (Bạn có thể tách ra để Backend xử lý cũng được)
    const address = document.querySelector('input[name="address"]') as HTMLInputElement;
    const town = document.querySelector('input[name="town"]') as HTMLInputElement;
    if (address && town) {
      setShippingAddress(`${address.value}, ${town.value}`);
    }
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Chi tiết hóa đơn</h2>
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        
        <div className="mb-5" onChange={handleInputChange}>
          <label htmlFor="address" className="block mb-2.5">Street Address <span className="text-red">*</span></label>
          <input type="text" name="address" id="address" placeholder="House number and street name" className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
          
          <div className="mt-5">
             <input type="text" name="addressTwo" id="addressTwo" placeholder="Apartment, suite, unit, etc. (optional)" className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
          </div>
        </div>

        <div className="mb-5" onChange={handleInputChange}>
          <label htmlFor="town" className="block mb-2.5">Town/ City <span className="text-red">*</span></label>
          <input type="text" name="town" id="town" className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
        </div>
      </div>
    </div>
  );
};
export default Billing;