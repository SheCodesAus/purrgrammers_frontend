async function getBoard(boardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error fetching board";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default getBoard;