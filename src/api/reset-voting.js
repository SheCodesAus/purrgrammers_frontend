async function resetVoting(boardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/reset_voting/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const fallbackError = "Error resetting voting";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default resetVoting;
