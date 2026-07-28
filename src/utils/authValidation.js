import { EMAIL_REGEX, PW_REGEX } from "./regex";

export const validateAuthField = (name, inputValue, values) => {
  if (!inputValue) {
    return "required";
  }

  switch (name) {
    case "email":
      return EMAIL_REGEX.test(inputValue) ? true : "invalidEmail";
    case "username":
      return true;
    case "password":
      return PW_REGEX.test(inputValue) ? true : "invalidPw";
    case "passwordConfirm":
      return inputValue === values.password ? true : "invalidConfirmPw";
    default:
      return true;
  }
};

const validateFields = (values, fieldNames) =>
  fieldNames.reduce(
    (result, name) => ({
      ...result,
      [name]: validateAuthField(name, values[name], values),
    }),
    {}
  );

export const validateLogin = (values) =>
  validateFields(values, ["email", "password"]);

export const validateRegistration = (values) =>
  validateFields(values, [
    "email",
    "username",
    "password",
    "passwordConfirm",
  ]);

export const isValidAuthForm = (validation) =>
  Object.values(validation).every((result) => result === true);
