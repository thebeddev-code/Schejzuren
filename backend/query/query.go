// Package query provides utils to construct complex database queries
package query

import (
	"fmt"
	"reflect"
	"strings"

	"gorm.io/gorm"
)

type FilterCondition[T any] struct {
	Eq       *T      `json:"eq,omitempty"`
	Ne       *T      `json:"ne,omitempty"`
	Gt       *T      `json:"gt,omitempty"`
	Lt       *T      `json:"lt,omitempty"`
	Gte      *T      `json:"gte,omitempty"`
	Lte      *T      `json:"lte,omitempty"`
	In       []T     `json:"in,omitempty"`
	NotIn    []T     `json:"notIn,omitempty"`
	Like     *string `json:"like,omitempty"`
	Contains *string `json:"contains,omitempty"`
}

type Paginate struct {
	Size   int `json:"size"`
	Offset int `json:"offset"`
	Page   int `json:"page"`
}

type BaseQuery struct {
	Asc      []string  `json:"asc,omitempty"`
	Desc     []string  `json:"desc,omitempty"`
	Paginate *Paginate `json:"paginate,omitempty"`
}

type ItemFilter struct {
	ID    *FilterCondition[uint]   `json:"id,omitempty"`
	Title *FilterCondition[string] `json:"title,omitempty"`

	// AND []*ItemFilter `json:"AND,omitempty"`
	// OR  []*ItemFilter `json:"OR,omitempty"`
	// NOT *ItemFilter   `json:"NOT,omitempty"`
}

type ItemQuery struct {
	BaseQuery
	Where *ItemFilter `json:"where,omitempty"`
}

func ApplyItemQuery(q *ItemQuery) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if q == nil {
			return db
		}

		// Pagination
		if q.Paginate != nil {
			size := q.Paginate.Size
			if size <= 0 {
				size = 100
			}

			db = db.Limit(size)

			if q.Paginate.Page > 0 {
				offset := (q.Paginate.Page - 1) * size
				db = db.Offset(offset)
			} else if q.Paginate.Offset > 0 {
				db = db.Offset(q.Paginate.Offset)
			}
		}

		// Sorting
		for _, field := range q.Asc {
			db = db.Order(fmt.Sprintf("%s ASC", field))
		}
		for _, field := range q.Desc {
			db = db.Order(fmt.Sprintf("%s DESC", field))
		}

		// Filtering
		if q.Where != nil {
			db = buildWhere(db, q.Where)
		}

		return db
	}
}

// buildWhere recursively generates the GORM clauses
func buildWhere(db *gorm.DB, f *ItemFilter) *gorm.DB {
	if f == nil {
		return db
	}

	db = applyFilter(db, f, nil)
	// FIXME: broken filtering

	// for _, sub := range f.AND {
	// 	db = db.Where(func(tx *gorm.DB) *gorm.DB {
	// 		return buildWhere(tx, sub)
	// 	})
	// }
	//
	// if len(f.OR) > 0 {
	// 	db = db.Where(func(tx *gorm.DB) *gorm.DB {
	// 		for i, sub := range f.OR {
	// 			if i == 0 {
	// 				tx = buildWhere(tx, sub)
	// 			} else {
	// 				tx = tx.Or(func(tx2 *gorm.DB) *gorm.DB {
	// 					return buildWhere(tx2, sub)
	// 				})
	// 			}
	// 		}
	// 		return tx
	// 	})
	// }
	//
	// if f.NOT != nil {
	// 	db = db.Not(func(tx *gorm.DB) *gorm.DB {
	// 		return buildWhere(tx, f.NOT)
	// 	})
	// }

	return db
}

func applyFilter[T any](db *gorm.DB, f *T, fieldMap map[string]string) *gorm.DB {
	if f == nil {
		return db
	}

	rv := reflect.ValueOf(f)
	if rv.Kind() != reflect.Pointer || rv.IsNil() {
		return db
	}

	v := rv.Elem()
	if v.Kind() != reflect.Struct {
		return db
	}

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldName := v.Type().Field(i).Name

		if fieldName == "AND" || fieldName == "OR" || fieldName == "NOT" {
			continue
		}

		if field.IsZero() || (field.Kind() == reflect.Pointer && field.IsNil()) {
			continue
		}

		// Map Go field name to DB column
		dbField := fieldMap[fieldName]
		if dbField == "" {
			dbField = strings.ToLower(fieldName)
		}

		db = applyCondition(db, dbField, field.Interface())
	}

	return db
}

func applyCondition(db *gorm.DB, column string, cond any) *gorm.DB {
	if cond == nil {
		return db
	}

	switch c := cond.(type) {
	case *FilterCondition[uint]:
		return applyConditionGeneric(db, column, c)
	case *FilterCondition[string]:
		return applyConditionGeneric(db, column, c)
	case *FilterCondition[int]:
		return applyConditionGeneric(db, column, c)
	default:
		return db
	}
}

func applyConditionGeneric[T any](db *gorm.DB, column string, c *FilterCondition[T]) *gorm.DB {
	if c.Eq != nil {
		return db.Where(fmt.Sprintf("%s = ?", column), *c.Eq)
	}
	if c.Ne != nil {
		return db.Where(fmt.Sprintf("%s <> ?", column), *c.Ne)
	}
	if c.Gt != nil {
		return db.Where(fmt.Sprintf("%s > ?", column), *c.Gt)
	}
	if c.Gte != nil {
		return db.Where(fmt.Sprintf("%s >= ?", column), *c.Gte)
	}
	if c.Lt != nil {
		return db.Where(fmt.Sprintf("%s < ?", column), *c.Lt)
	}
	if c.Lte != nil {
		return db.Where(fmt.Sprintf("%s <= ?", column), *c.Lte)
	}
	if len(c.In) > 0 {
		return db.Where(fmt.Sprintf("%s IN ?", column), c.In)
	}
	if len(c.NotIn) > 0 {
		return db.Where(fmt.Sprintf("%s NOT IN ?", column), c.NotIn)
	}
	if c.Like != nil {
		return db.Where(fmt.Sprintf("%s LIKE ?", column), *c.Like)
	}
	if c.Contains != nil {
		return db.Where(fmt.Sprintf("%s LIKE ?", column), "%"+*c.Contains+"%")
	}
	return db
}
