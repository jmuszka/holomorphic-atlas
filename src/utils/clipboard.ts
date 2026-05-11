export const copy = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error(err);
  });
};
