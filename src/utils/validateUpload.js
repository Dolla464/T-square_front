export function validateImageFile(
  file,
  {
    maxBytes = 2 * 1024 * 1024,
    types = ["image/jpeg", "image/png", "image/webp"],
  } = {},
) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!types.includes(file.type)) {
    throw new Error("Invalid file type.");
  }

  if (file.size > maxBytes) {
    throw new Error("File is too large.");
  }

  return true;
}
