export const trimAndLowercase = (s: string) => s.trim().toLowerCase();

export const shortenString = (s: string, maxLen: number) => {
	if (s.length > maxLen) return `${s.slice(0, maxLen)}...`;
	return s;
};
