const API_URL = import.meta.env.VITE_API_URL;

// GET board info for the join page (no auth needed)
export async function getBoardByInviteCode(inviteCode) {
    const url = `${API_URL}/api/retro-boards/join/${inviteCode}/`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        const fallbackError = "Invalid invite link";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        throw new Error(data?.error ?? fallbackError);
    }

    return await response.json();
}

// POST to join the board (optional auth header for logged-in users)
export async function joinBoard(inviteCode, displayName, token) {
    const url = `${API_URL}/api/retro-boards/join/${inviteCode}/`;
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = token;
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ display_name: displayName }),
    });

    if (!response.ok) {
        const fallbackError = "Failed to join board";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        throw new Error(data?.error ?? fallbackError);
    }

    return await response.json();
}
