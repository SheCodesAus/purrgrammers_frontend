async function createActionItem(boardId, content, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/action-items/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({
            retro_board_id: boardId,
            content: content
        })
    });

    if (!response.ok) {
        const fallbackError = "Error creating action item";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default createActionItem;
