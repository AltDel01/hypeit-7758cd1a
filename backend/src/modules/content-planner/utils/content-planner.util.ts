export function cleanAndParseJson(text: string): string[][] {
  // 1. Hapus tanda ```json dan ``` di awal/akhir jika ada
  const cleanText = text.replace(/```json|```/g, '').trim();

  try {
    // 2. Ubah String menjadi Array Asli (Parsing)
    const parsedData = JSON.parse(cleanText) as [];

    // 3. (Opsional but recommended) Validasi apakah benar array
    if (!Array.isArray(parsedData)) {
      throw new Error('Format output AI bukan array');
    }

    // Type-nya jadi string[][] (Array of Array of string)
    return parsedData;
  } catch (error) {
    console.error('Gagal parsing JSON dari AI:', error);
    return []; // Atau throw error
  }
}
