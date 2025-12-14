async function removeFacilitator(boardId, userId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/remove_facilitator/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({ user_id: userId })
    });

    if (!response.ok) {
        // Handle permission errors with a friendly message
        if (response.status === 403) {
            throw new Error("Only facilitators can remove facilitators");
        }

        const data = await response.json().catch(() => {
            throw new Error("Error removing facilitator");
        });

        const errorMessage = data?.error ?? "Error removing facilitator";
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default removeFacilitator;
