// Package services provides core business logic
package services

import (
	"context"
	"sync"

	"schejzuren/backend/utils"

	"gorm.io/gorm"
)

type (
	Status   string
	Priority string
)

const (
	StatusActivity   Status = "todo"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"

	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type ActivityItem struct {
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

type activityService struct {
	db  *gorm.DB
	ctx *context.Context
}

var (
	activityServiceInstance *activityService
	onceActivityService     sync.Once
)

func NewActivityService(db *gorm.DB) *activityService {
	if activityServiceInstance == nil {
		onceActivityService.Do(func() {
			db.AutoMigrate(&ActivityItem{})
			activityServiceInstance = &activityService{db: db}
		})
	}
	return activityServiceInstance
}

func (s *activityService) Start(ctx context.Context) {
	s.ctx = &ctx
}

func (s *activityService) GetActivities(q *utils.ItemQuery) ([]ActivityItem, error) {
	db := utils.ApplyItemQuery(q)(s.db)
	var activities []ActivityItem
	result := db.Find(&activities)
	return activities, result.Error
}

func (s *activityService) CreateActivity(activity ActivityItem) error {
	return s.db.Create(&activity).Error
}

func (s *activityService) UpdateActivity(id int, updated ActivityItem) error {
	var activity ActivityItem
	if err := s.db.First(&activity, id).Error; err != nil {
		return err
	}
	return s.db.Model(&activity).Updates(updated).Error
}

func (s *activityService) DeleteActivity(id int) error {
	return s.db.Delete(&ActivityItem{}, id).Error
}
