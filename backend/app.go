// Package backend provides core application services including
// database connections and business logic operations.
package backend

import (
	"context"

	"schejzuren/backend/services"

	"gorm.io/gorm"
)

// App struct
type App struct {
	ctx             context.Context
	ActivityService *services.ActivityService
}

// NewApp creates a new App application struct
func NewApp(db *gorm.DB) *App {
	return &App{
		ActivityService: services.NewActivityService(db),
	}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}
