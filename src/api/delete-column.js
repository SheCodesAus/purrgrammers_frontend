async function deleteColumn(columnId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/columns/${columnId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error deleting column";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    // delete returns 204 no content, no json to parse
    return ;
}

export default deleteColumn;