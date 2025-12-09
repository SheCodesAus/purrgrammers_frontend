async function getReport(boardId, token) {
  const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/report/`;
  
  console.log('Fetching report from:', url);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    },
  });

  if (!response.ok) {
    console.error('Report API error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error response:', errorText);
    
    let errorMessage = `Failed to fetch report: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export default getReport;
