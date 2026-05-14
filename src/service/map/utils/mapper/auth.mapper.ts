import { RegisterFormValues } from "@/service/map/interfaces/auth.interface";

export const mapFormToCreateUserDto = (formData: RegisterFormValues) => {
  const nameParts = formData.fullName.trim().split(/\s+/);
  const lastName = nameParts[0] || "";
  const firstName = nameParts.slice(1).join(" ") || "";
  const payload = {
    lastName: lastName,
    firstName: firstName,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
    designation: formData.designation || "Customer",
  };

  return payload;
};