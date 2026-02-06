const BASE_URL = '/api';

export const noteService = {
    getAll: async () => {
        const res = await fetch(`${BASE_URL}/notes`);
        return res.json();
    },
    getOne: async (id: string) => {
        const res = await fetch(`${BASE_URL}/notes/${id}`);
        return res.json();
    },
    create: async (data: { title: string; content: string; tags?: string[] }) => {
        const res = await fetch(`${BASE_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    update: async (id: string, data: any) => {
        const res = await fetch(`${BASE_URL}/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`${BASE_URL}/notes/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },
};

export const bookmarkService = {
    getAll: async () => {
        const res = await fetch(`${BASE_URL}/bookmarks`);
        return res.json();
    },
    getOne: async (id: string) => {
        const res = await fetch(`${BASE_URL}/bookmarks/${id}`);
        return res.json();
    },
    create: async (data: { title: string; url: string; tags?: string[] }) => {
        const res = await fetch(`${BASE_URL}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    update: async (id: string, data: any) => {
        const res = await fetch(`${BASE_URL}/bookmarks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`${BASE_URL}/bookmarks/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },
};
