async function patchBoard(boardId, boardData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(boardData)
    });

    if (!response.ok) {
        const fallbackError = "Error updating board";

        // Handle permission errors with a friendly message
        if (response.status === 403) {
            throw new Error("You don't have permission to update this board");
        }

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default patchBoard;