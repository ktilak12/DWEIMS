const API_URL = 'http://localhost:5001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res) => {
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
    }

    if (!res.ok) {
        let errorMsg = 'Network request failed';
        try {
            const data = await res.json();
            if (data.message) errorMsg = data.message;
        } catch {
            try {
                errorMsg = await res.text();
            } catch {
                // Keep default
            }
        }
        
        // Enhance message with status code for easier debugging
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export const api = {
    login: async (username, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return handleResponse(res);
    },
    getMetrics: async () => {
        const res = await fetch(`${API_URL}/dashboard/metrics`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getInventory: async () => {
        const res = await fetch(`${API_URL}/inventory`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getAvailableInventory: async () => {
        const res = await fetch(`${API_URL}/inventory/available`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getAlerts: async () => {
        const res = await fetch(`${API_URL}/inventory/alerts`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getPersonnel: async () => {
        const res = await fetch(`${API_URL}/personnel`, { headers: getHeaders() });
        return handleResponse(res);
    },
    issueAsset: async (asset_id, officer_id, expected_return_days, quantity) => {
        const res = await fetch(`${API_URL}/inventory/issue`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ asset_id, officer_id, expected_return_days, quantity })
        });
        return handleResponse(res);
    },
    getIssued: async () => {
        const res = await fetch(`${API_URL}/inventory/issued`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getReturns: async () => {
        const res = await fetch(`${API_URL}/inventory/returns`, { headers: getHeaders() });
        return handleResponse(res);
    },
    returnAsset: async (issue_id, quantity) => {
        const res = await fetch(`${API_URL}/inventory/return`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ issue_id, quantity })
        });
        return handleResponse(res);
    },
    getProcurement: async () => {
        const res = await fetch(`${API_URL}/procurement`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getSuppliers: async () => {
        const res = await fetch(`${API_URL}/suppliers`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getAuditLogs: async () => {
        const res = await fetch(`${API_URL}/audit`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getIssues: async () => {
        const res = await fetch(`${API_URL}/issues`, { headers: getHeaders() });
        return handleResponse(res);
    }
};
