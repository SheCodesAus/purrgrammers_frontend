async function returnToColumn(actionItemId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/action-items/${actionItemId}/return-to-column/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error returning action to column";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default returnToColumn;