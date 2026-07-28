const AUTH_STORAGE_KEY = "user";

export const setAuthToken = (token, ttl) => {
    const item = {
        value: token,
        expires: Date.now() + ttl,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(item));
};

export const getAuthToken = () => {
    try {
        const item = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));

        if (!item?.value) {
            return null;
        }

        if (item.expires && Date.now() > item.expires) {
            clearAuthToken();
            return null;
        }

        return item.value;
    } catch {
        clearAuthToken();
        return null;
    }
};

export const clearAuthToken = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getAuthToken());
