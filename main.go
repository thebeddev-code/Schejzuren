package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	db, db_err := gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if db_err != nil {
		panic("failed to connect database")
	}
	// Create an instance of the app structure
	app := NewApp(db)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Schejzuren",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			app.TodoService,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
