


export const readFileAsync = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result.toString());
      } else {
        reject('Failed to read file');
      }
    };

    reader.onerror = () => {
      reject('Failed to read file');
    };

    reader.readAsText(file);
  });
}
