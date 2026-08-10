import { DEMO_MODE } from "../config/runtime";

const apiBasePath = `${process.env.REACT_APP_PATH || ""}/api`.replace(/\/+/g, "/");

export const handleUnhandledRequest = (request, print) => {
  const { pathname } = new URL(request.url);

  if (pathname === apiBasePath || pathname.startsWith(`${apiBasePath}/`)) {
    print.error();
  }
};

export const enableMocking = async () => {
  if (!DEMO_MODE) {
    return;
  }

  const { worker } = await import("./browser");
  return worker.start({ onUnhandledRequest: handleUnhandledRequest });
};
