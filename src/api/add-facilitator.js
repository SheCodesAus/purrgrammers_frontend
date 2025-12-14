async function addFacilitator(boardId, userId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/add_facilitator/`;

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
            throw new Error("Only facilitators can add other facilitators");
        }

        const data = await response.json().catch(() => {
            throw new Error("Error adding facilitator");
        });

        const errorMessage = data?.error ?? "Error adding facilitator";
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default addFacilitator;
