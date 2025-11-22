async function getUsers(token) {
    const url = `${import.meta.env.VITE_API_URL}/api/users/`;

    const response = await fetch(url, {
        method: "GET", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": token  // Use token as-is since it already has "Token " prefix
        }
    });

    if (!response.ok) {
        const fallbackError = "Error fetching users";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default getUsers;