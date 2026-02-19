// Package utils provides common utils for dealiting with strings, numbers etc.
package utils

import (
	"strings"
	"unicode"
	"unicode/utf8"
)

func StringLen(s string) int {
	return utf8.RuneCountInString(s)
}

func FirstCharToLowerASCII(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}

func ToSnakeCase(s string) string {
	if len(s) == 0 {
		return s
	}

	var result []string
	start := 0
	for i := 0; i < StringLen(s)-1; i++ {
		// Check for lowercase to uppercase transition
		if unicode.IsLower(rune(s[i])) && unicode.IsUpper(rune(s[i+1])) {

			// Slice prev word and lowercase it
			result = append(result, strings.ToLower(s[start:i+1]))
			start = i + 1
		}
	}

	// Push the last word
	result = append(result, strings.ToLower(s[start:]))

	return strings.Join(result, "_")
}
