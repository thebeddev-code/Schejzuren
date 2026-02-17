package backend

import (
	"context"
	"fmt"

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
} // startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
