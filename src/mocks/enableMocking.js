import { DEMO_MODE } from "../config/runtime";

export const enableMocking = async () => {
  if (!DEMO_MODE) {
    return;
  }

  const { worker } = await import("./browser");
  return worker.start({ onUnhandledRequest: "bypass" });
};
