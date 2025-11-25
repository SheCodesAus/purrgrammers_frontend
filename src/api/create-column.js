async function createColumn(columnData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/columns/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(columnData)
    });

    if (!response.ok) {
        const fallbackError = "Error creating column";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }
    
    return await response.json();
};

export default createColumn;