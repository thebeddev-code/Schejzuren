// Package utils provides common utils for dealiting with strings, numbers etc.
package utils

import "strings"

func FirstCharToLowerASCII(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}
