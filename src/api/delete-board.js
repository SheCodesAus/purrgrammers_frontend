async function deleteBoard(boardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error deleting board";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    // delete returns 204 no content, so no JSON to parse
    return;
}

export default deleteBoard;