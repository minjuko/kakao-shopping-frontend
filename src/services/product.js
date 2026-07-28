import {instance} from "./index";

export const fetchProducts = (page = 0) => {
    return instance
        .get("/products", { params: { page } })
        .then(({ data }) => data.response);
};

export const getProductById = (id) => {
    if(!id) {
        throw Error("id가 없습니다.");
    }
    return instance.get(`/products/${id}`).then(({ data }) => data.response);
};
