package models

import "gorm.io/gorm"

type AdoptionStatus string

const (
	AdoptionStatusPending  AdoptionStatus = "Pendente"
	AdoptionStatusApproved AdoptionStatus = "Aprovado"
	AdoptionStatusRejected AdoptionStatus = "Rejeitado"
)

type Adoption struct {
	gorm.Model
	PetID          uint           `json:"pet_id"          gorm:"not null"`
	Pet            Pet            `json:"pet,omitempty"   gorm:"foreignKey:PetID"`
	AdopterName    string         `json:"nome_adotante"   gorm:"not null"`
	Email          string         `json:"email"           gorm:"not null"`
	Phone          string         `json:"telefone"        gorm:"not null"`
	AdoptionReason string         `json:"motivo_adocao"`
	Status         AdoptionStatus `json:"status"          gorm:"not null;default:'Pendente'"`
}

type CreateAdoptionRequest struct {
	PetID          uint   `json:"pet_id"        binding:"required"`
	AdopterName    string `json:"nome_adotante" binding:"required"`
	Email          string `json:"email"         binding:"required,email"`
	Phone          string `json:"telefone"      binding:"required"`
	AdoptionReason string `json:"motivo_adocao"`
}

type UpdateAdoptionStatusRequest struct {
	Status AdoptionStatus `json:"status" binding:"required,oneof=Pendente Aprovado Rejeitado"`
}
