const patchBoard = async (boardId, boardData, token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(boardData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

export default patchBoard;