async function postUser(username, email, password) {
    const token = window.localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/api/users/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({ 
            "username": username,
            "email": email,
            "password": password,
            })
    });

    if (!response.ok) {
        const fallbackError = "Error fetching team";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default postUser;