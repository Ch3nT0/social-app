import { getCookie } from '../helpers/cookie';
const API_DOMAIN = process.env.REACT_APP_API_DOMAIN;

export const get = async (Path) => {
    const response = await fetch(`${API_DOMAIN}${Path}`)
    const data = await response.json()
    return data;
}
export const post = async (Path, options) => {
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: "application/json"
        },
        body: JSON.stringify(options)
    })
    const data = await response.json()
    return data;
}

export const put = async (Path, options) => {
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: "application/json"
        },
        body: JSON.stringify(options)
    })
    const data = await response.json()
    return data;
}

export const del = async (Path) => {
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: 'DELETE'
    })
    const data = await response.json()
    return data;
}
export const patch = async (path, options = {}) => {

    const response = await fetch(`${API_DOMAIN}${path}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(options)
    });
    const data = await response.json()
    return data;
};

export const getAuth = async (Path) => {
    const token = getCookie("token");
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    const data = await response.json();
    return data;
};

export const postAuth = async (Path, options) => {
    const token = getCookie("token");
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
};

export const delAuth = async (Path) => {
    const token = getCookie("token");
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    const data = await response.json();
    return data;
};

export const patchAuth = async (Path, options = {}) => {
    const token = getCookie("token");
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
};

export const putAuth = async (Path, options = {}) => {
    const token = getCookie("token");
    const response = await fetch(`${API_DOMAIN}${Path}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options),
    });
    const data = await response.json();
    return data;
};