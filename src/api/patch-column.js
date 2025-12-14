async function patchColumn(columnId, columnData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/columns/${columnId}`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(columnData)
    });

    if (!response.ok) {
        const fallbackError = "Error updating column";

        // Handle permission errors with a friendly message
        if (response.status === 403) {
            throw new Error("You don't have permission to edit columns");
        }

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }
    
    return await response.json();
};

export default patchColumn;