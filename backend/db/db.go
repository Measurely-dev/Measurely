package db

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	Conn *sqlx.DB
}

func NewPostgres(url string) (*DB, error) {
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(200)
	db.SetMaxIdleConns(100)
	db.SetConnMaxLifetime(30 * time.Minute)

	err = migrate(db)
	if err != nil {
		log.Fatal("Migration failed. aborting")
	}

	return &DB{Conn: db}, nil
}

func migrate(db *sqlx.DB) error {
	migrationsDir := "migrations"

	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Println(err)
		return err
	}

	var migrationFiles []string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, filepath.Join(migrationsDir, file.Name()))
		}
	}

	sort.Strings(migrationFiles)

	appliedMigrations := make(map[string]bool)
	rows, err := db.Query("SELECT filename FROM migrations")
	if err == nil {
		defer rows.Close()

		for rows.Next() {
			var filename string
			if err := rows.Scan(&filename); err != nil {
				log.Println("Error scanning migration row:", err)
				return err
			}
			appliedMigrations[filename] = true
		}
	}

	for _, migrationFile := range migrationFiles {
		if appliedMigrations[filepath.Base(migrationFile)] {
			fmt.Printf("Skipping already applied migration: %s\n", migrationFile)
			continue
		}

		b, err := os.ReadFile(migrationFile)
		if err != nil {
			return err
		}
		_, err = db.Exec(string(b))
		if err != nil {
			log.Printf("Error running migration %s: %v\n", migrationFile, err)
			return err
		}

		_, err = db.Exec("INSERT INTO migrations (filename) VALUES ($1)", filepath.Base(migrationFile))
		if err != nil {
			log.Printf("Error recording migration %s: %v\n", migrationFile, err)
			return err
		}

		fmt.Printf("Successfully ran migration: %s\n", migrationFile)
	}

	return nil
}

func (d *DB) Close() error {
	return d.Conn.Close()
}
