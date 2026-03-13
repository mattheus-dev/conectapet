package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"uniqueIndex;not null"`
	Password string `json:"-"        gorm:"not null"` // hash bcrypt — nunca exposto no JSON
	Role     string `json:"role"     gorm:"not null;default:'admin'"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}
