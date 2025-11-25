async function postSignup(
  email,
  username,
  first_name,
  last_name,
  password,
  password_confirm
) {
  const url = `${import.meta.env.VITE_API_URL}users/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      password: password,
      password_confirm: password_confirm,
    }),
  });

  if (!response.ok) {
    const fallbackError = `Error trying to sign up`;
    const data = await response.json().catch(() => {
      throw new Error(fallbackError);
    });

    const errorMessage = data?.detail ?? fallbackError;
    throw new Error(errorMessage);
  }

  return await response.json();
}

export default postSignup;
