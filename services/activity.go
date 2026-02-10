package services

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type (
	Status   string
	Priority string
)

const (
	StatusActivity       Status = "todo"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"

	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type Activity struct {
	ID             int      `json:"id" gorm:"primaryKey"`
	Title          string   `json:"title"`
	Description    *string  `json:"description"`
	Tags           []string `json:"tags" gorm:"serializer:json"`
	Color          *string  `json:"color"`
	Status         Status   `json:"status" gorm:"type:varchar(20)"`
	Priority       Priority `json:"priority" gorm:"type:varchar(20)"`
	StartsAt       *string  `json:"startsAt"`
	Due            *string  `json:"due"`
	UpdatedAt      *string  `json:"updatedAt"`
	CreatedAt      *string  `json:"createdAt"`
	CompletedAt    *string  `json:"completedAt"`
	IsRecurring    bool     `json:"isRecurring"`
	RecurrenceRule *string  `json:"recurrenceRule"`
}

type ActivityService struct {
	db *gorm.DB
}

func NewActivityService(db *gorm.DB) *ActivityService {
	db.AutoMigrate(&Activity{})
	return &ActivityService{db: db}
}

func (s *ActivityService) GetActivities() ([]Activity, error) {
	var activities []Activity
	weekday := time.Now().Weekday().String()
	lowercaseWeekday := strings.ToLower(weekday)
	result := s.db.Where("recurrence_rule LIKE ?", "%everyday%").Or("recurrence_rule LIKE ?", "%"+lowercaseWeekday+"%").Find(&activities)
	return activities, result.Error
}

func (s *ActivityService) CreateActivity(activity Activity) error {
	return s.db.Create(&activity).Error
}

func (s *ActivityService) UpdateActivity(id int, updated Activity) error {
	var activity Activity
	if err := s.db.First(&activity, id).Error; err != nil {
		return err
	}
	return s.db.Model(&activity).Updates(updated).Error
}

func (s *ActivityService) DeleteActivity(id int) error {
	return s.db.Delete(&Activity{}, id).Error
}
