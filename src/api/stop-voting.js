async function stopVoting(boardId, token) {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/stop_voting/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to stop voting");
    }

    return await response.json();
}

export default stopVoting;
