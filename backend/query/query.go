// Package query provides utils to construct complex database queries
package query

import (
	"fmt"
	"reflect"

	"schejzuren/backend/utils"

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
	ID             *FilterCondition[uint]   `json:"id,omitempty"`
	Title          *FilterCondition[string] `json:"title,omitempty"`
	RecurrenceRule *FilterCondition[string] `json:"recurrenceRule,omitempty"`

	AND []*ItemFilter `json:"AND,omitempty"`
	OR  []*ItemFilter `json:"OR,omitempty"`
	NOT *ItemFilter   `json:"NOT,omitempty"`
}

type ItemQuery struct {
	BaseQuery
	Where *ItemFilter `json:"where,omitempty"`
}

type QueryType int

const (
	queryAND QueryType = iota
	queryOR
	queryNOT
)

func ApplyItemQuery(q *ItemQuery) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if q == nil {
			return db
		}

		// Apply pagination
		if q.Paginate != nil {

			// Use default page of 100 if not size is provided
			size := q.Paginate.Size
			if size <= 0 {
				size = 100
			}

			db = db.Limit(size)

			// Calculate items offset
			offset := q.Paginate.Offset
			if q.Paginate.Page > 1 {
				offset += (q.Paginate.Page - 1) * size
			}

			db = db.Offset(offset)
		}

		// Apply sorting
		for _, field := range q.Asc {
			db = db.Order(fmt.Sprintf("%s ASC", field))
		}
		for _, field := range q.Desc {
			db = db.Order(fmt.Sprintf("%s DESC", field))
		}

		// Apply filtering
		if q.Where != nil {
			db = buildWhere(db, q.Where, queryAND)
		}

		return db
	}
}

// buildWhere recursively generates the GORM clauses
func buildWhere(db *gorm.DB, f *ItemFilter, queryType QueryType) *gorm.DB {
	if f == nil {
		return db
	}

	// Apply filters for current fields and query type
	db = applyFilter(db, f, queryType)

	// Recursively apply logical operators
	for _, sub := range f.AND {
		db = buildWhere(db, sub, queryAND)
	}

	for _, sub := range f.OR {
		db = buildWhere(db, sub, queryOR)
	}

	if f.NOT != nil {
		db = buildWhere(db, f.NOT, queryNOT)
	}

	return db
}

func applyFilter[T any](db *gorm.DB, filters *T, queryType QueryType) *gorm.DB {
	if filters == nil {
		return db
	}

	// Check if [filters] a valid pointer
	ptr := reflect.ValueOf(filters)
	if ptr.Kind() != reflect.Pointer || ptr.IsNil() {
		return db
	}

	// Deref and check if struct
	filtersValue := ptr.Elem()
	if filtersValue.Kind() != reflect.Struct {
		return db
	}

	// Go over filters
	for i := 0; i < filtersValue.NumField(); i++ {
		field := filtersValue.Field(i)
		fieldName := filtersValue.Type().Field(i).Name

		if fieldName == "AND" || fieldName == "OR" || fieldName == "NOT" {
			continue
		}

		if field.IsZero() || (field.Kind() == reflect.Pointer && field.IsNil()) {
			continue
		}

		db = applyCondition(db, utils.ToSnakeCase(fieldName), field.Interface(), queryType)
	}

	return db
}

func applyCondition(db *gorm.DB, column string, cond any, queryType QueryType) *gorm.DB {
	if cond == nil {
		return db
	}

	// Match filter condition type
	switch c := cond.(type) {
	case *FilterCondition[uint]:
		return applyConditionGeneric(db, column, c, queryType)
	case *FilterCondition[string]:
		return applyConditionGeneric(db, column, c, queryType)
	case *FilterCondition[int]:
		return applyConditionGeneric(db, column, c, queryType)
	default:
		return db
	}
}

func applyConditionGeneric[T any](db *gorm.DB, column string, c *FilterCondition[T], queryType QueryType) *gorm.DB {
	cond := func(format string, args ...interface{}) *gorm.DB {
		switch queryType {
		case queryOR:
			return db.Or(format, args...)
		case queryNOT:
			return db.Not(fmt.Sprintf(format, column), args...)
		case queryAND:
			fallthrough
		default:
			return db.Where(format, args...)
		}
	}

	if c.Eq != nil {
		return cond(fmt.Sprintf("%s = ?", column), *c.Eq)
	}
	if c.Ne != nil {
		return cond(fmt.Sprintf("%s <> ?", column), *c.Ne)
	}
	if c.Gt != nil {
		return cond(fmt.Sprintf("%s > ?", column), *c.Gt)
	}
	if c.Gte != nil {
		return cond(fmt.Sprintf("%s >= ?", column), *c.Gte)
	}
	if c.Lt != nil {
		return cond(fmt.Sprintf("%s < ?", column), *c.Lt)
	}
	if c.Lte != nil {
		return cond(fmt.Sprintf("%s <= ?", column), *c.Lte)
	}
	if len(c.In) > 0 {
		return cond(fmt.Sprintf("%s IN ?", column), c.In)
	}
	if len(c.NotIn) > 0 {
		return cond(fmt.Sprintf("%s NOT IN ?", column), c.NotIn)
	}
	if c.Like != nil {
		return cond(fmt.Sprintf("%s LIKE ?", column), *c.Like)
	}
	if c.Contains != nil {
		return cond(fmt.Sprintf("%s LIKE ?", column), "%"+*c.Contains+"%")
	}
	return db
}
