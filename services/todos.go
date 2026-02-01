package services

import (
	"time"

	"gorm.io/gorm"
)

type Todo struct {
	gorm.Model
	// ID             int      `json:"id" gorm:"primaryKey"`
	Title          string   `json:"title"`
	Description    *string  `json:"description"`
	Tags           []string `json:"tags" gorm:"serializer:json"`
	Color          *string  `json:"color"`
	Status         string   `json:"status"`
	Priority       string   `json:"priority"`
	StartsAt       *string  `json:"startsAt"`
	Due            *string  `json:"due"`
	UpdatedAt      *string  `json:"updatedAt"`
	CreatedAt      *string  `json:"createdAt"`
	CompletedAt    *string  `json:"completedAt"`
	IsRecurring    bool     `json:"isRecurring"`
	RecurrenceRule *string  `json:"recurrenceRule"`
}

type TodoService struct {
	db *gorm.DB
}

func NewTodoService(db *gorm.DB) *TodoService {
	db.AutoMigrate(&Todo{})
	return &TodoService{db: db}
}

func (s *TodoService) GetTodos() ([]Todo, error) {
	var todos []Todo
	now := time.Now().UTC()
	isoString := now.Format(time.RFC3339)
	color := "blue"
	rule := "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
	description := "Study Go language and build a project"
	mockTodo := Todo{
		// ID:             1,
		Title:          "Learn Go",
		Description:    &description,
		Tags:           []string{"study", "go"},
		Color:          &color,
		Status:         "in-progress",
		Priority:       "high",
		StartsAt:       &isoString,
		Due:            &isoString,
		UpdatedAt:      &isoString,
		CreatedAt:      &isoString,
		CompletedAt:    nil,
		IsRecurring:    true,
		RecurrenceRule: &rule,
	}
	result := s.db.Find(&todos)
	todos = append(todos, mockTodo)
	return todos, result.Error
}

func (s *TodoService) CreateTodo(todo Todo) error {
	return s.db.Create(&todo).Error
}

func (s *TodoService) UpdateTodo(id int, updated Todo) error {
	var todo Todo
	if err := s.db.First(&todo, id).Error; err != nil {
		return err
	}
	return s.db.Model(&todo).Updates(updated).Error
}

func (s *TodoService) DeleteTodo(id int) error {
	return s.db.Delete(&Todo{}, id).Error
}
