// this is only if users want to completely delete an action item without returning it to a column
async function deleteActionItem(actionItemId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/action-items/${actionItemId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error deleting action item";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return true;
}

export default deleteActionItem;