package main

import (
	"embed"

	"schejzuren/backend"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	db, dbErr := gorm.Open(sqlite.Open("app.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if dbErr != nil {
		panic("failed to connect database")
	}
	// Create an instance of the app structure
	app := backend.NewApp(db)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Schejzuren",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			app,
			app.ActivityService,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
