async function patchActionItem(actionItemId, data, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/action-items/${actionItemId}/`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const fallbackError = "Error updating action item";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default patchActionItem;