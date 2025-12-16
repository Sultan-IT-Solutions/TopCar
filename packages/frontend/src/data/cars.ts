// src/data/cars.ts

export type Car = {
  id: number
  name: string
  image: string
  galleryImages?: string[];
  brand: string
  class: 'Economy' | 'Business' | 'Premium' | 'Luxury'
  description?: string
  pricing: {
    withoutDriver?: { [key: string]: number };
    withDriver?: { [key: string]: number };
    transfer?: number;
  }
}