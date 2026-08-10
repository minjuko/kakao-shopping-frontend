import { delay, http, HttpResponse } from "msw";
import { mockProducts } from "./data";
import {
  addMockCartItems,
  getMockCart,
  getMockOrder,
  saveMockOrder,
  updateMockCartItems,
} from "./store";

const API_PATH = "*/api";
const PAGE_SIZE = 6;
const DEMO_TOKEN = "Bearer demo-token";

const success = (response, init) =>
  HttpResponse.json({ success: true, response }, init);

const error = (status, message) =>
  HttpResponse.json(
    { success: false, error: { message } },
    { status }
  );

const requireAuth = (request) => {
  const token = request.headers.get("authorization");
  return token === DEMO_TOKEN;
};

export const handlers = [
  http.get(`${API_PATH}/products`, async ({ request }) => {
    await delay(250);
    const page = Number(new URL(request.url).searchParams.get("page") ?? 0);
    const start = page * PAGE_SIZE;
    return success(mockProducts.slice(start, start + PAGE_SIZE));
  }),

  http.get(`${API_PATH}/products/:id`, async ({ params }) => {
    await delay(200);
    const product = mockProducts.find((item) => item.id === Number(params.id));
    return product ? success(product) : error(404, "상품을 찾을 수 없습니다.");
  }),

  http.post(`${API_PATH}/login`, async () => {
    await delay(300);
    return success(null, { headers: { Authorization: DEMO_TOKEN } });
  }),

  http.post(`${API_PATH}/join`, async () => {
    await delay(300);
    return success(null, { headers: { Authorization: DEMO_TOKEN } });
  }),

  http.post(`${API_PATH}/check`, () => success({ available: true })),

  http.get(`${API_PATH}/carts`, async ({ request }) => {
    await delay(200);
    if (!requireAuth(request)) {
      return error(401, "로그인이 필요한 서비스입니다.");
    }
    return success(getMockCart());
  }),

  http.post(`${API_PATH}/carts/add`, async ({ request }) => {
    await delay(250);
    if (!requireAuth(request)) {
      return error(401, "로그인이 필요한 서비스입니다.");
    }

    const items = await request.json();
    const result = addMockCartItems(items);
    if (result.error) {
      return error(result.error.status, result.error.message);
    }
    return success(result.response);
  }),

  http.post(`${API_PATH}/carts/update`, async ({ request }) => {
    await delay(250);
    if (!requireAuth(request)) {
      return error(401, "로그인이 필요한 서비스입니다.");
    }

    const updates = await request.json();
    return success(updateMockCartItems(updates));
  }),

  http.post(`${API_PATH}/orders/save`, async ({ request }) => {
    await delay(300);
    if (!requireAuth(request)) {
      return error(401, "로그인이 필요한 서비스입니다.");
    }

    const payload = await request.json();
    const result = saveMockOrder(payload.cartIds);
    if (result.error) {
      return error(result.error.status, result.error.message);
    }
    return success(result.response);
  }),

  http.get(`${API_PATH}/orders/:id`, async ({ request, params }) => {
    await delay(200);
    if (!requireAuth(request)) {
      return error(401, "로그인이 필요한 서비스입니다.");
    }
    const order = getMockOrder(params.id);
    return order ? success(order) : error(404, "주문 내역을 찾을 수 없습니다.");
  }),

  http.all(`${API_PATH}/*`, ({ request }) =>
    error(501, `지원하지 않는 API 요청입니다: ${request.method}`)
  ),
];
