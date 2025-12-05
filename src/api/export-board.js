async function exportBoard(boardId, format, token) {
  const url = `${
    import.meta.env.VITE_API_URL
  }/api/retro-boards/${boardId}/export/?format=${format}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "board_export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => console.error("Export failed:", error));

  if (!response.ok) {
    const fallbackError = "Error exporting board";
    const data = await response.json().catch(() => {
      throw new Error(fallbackError);
    });

    const errorMessage = data?.detail ?? fallbackError;
    throw new Error(errorMessage);
  }

  return await response.blob();
}

export default exportBoard;
