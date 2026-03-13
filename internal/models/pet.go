package models

import "gorm.io/gorm"

type PetSpecies string
type PetStatus string

const (
	SpeciesDog   PetSpecies = "Cachorro"
	SpeciesCat   PetSpecies = "Gato"
	SpeciesOther PetSpecies = "Outro"
)

const (
	PetStatusAvailable PetStatus = "Disponível"
	PetStatusAdopted   PetStatus = "Adotado"
)

type Pet struct {
	gorm.Model
	Name        string     `json:"nome"         gorm:"not null"`
	Species     PetSpecies `json:"especie"      gorm:"not null"`
	Age         int        `json:"idade"        gorm:"not null"`
	Description string     `json:"descricao"`
	ImageURL    string     `json:"url_imagem"`
	Status      PetStatus  `json:"status"       gorm:"not null;default:'Disponível'"`
	Adoptions   []Adoption `json:"adocoes,omitempty" gorm:"foreignKey:PetID"`
}

type CreatePetRequest struct {
	Name        string     `json:"nome"      binding:"required"`
	Species     PetSpecies `json:"especie"   binding:"required,oneof=Cachorro Gato Outro"`
	Age         int        `json:"idade"     binding:"gte=0"`
	Description string     `json:"descricao"`
	ImageURL    string     `json:"url_imagem"`
}

type UpdatePetStatusRequest struct {
	Status PetStatus `json:"status" binding:"required,oneof=Disponível Adotado"`
}
