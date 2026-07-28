export const enableMocking = async () => {
  if (process.env.REACT_APP_ENABLE_MOCKS !== "true") {
    return;
  }

  const { worker } = await import("./browser");
  return worker.start({ onUnhandledRequest: "bypass" });
};
