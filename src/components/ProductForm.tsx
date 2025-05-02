
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { Product } from '@/utils/types';
import { mockProducts } from '@/utils/mockData';

interface ProductFormProps {
  farmerId: string;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  editProduct?: Product;
}

const ProductForm = ({ farmerId, onSubmit, onCancel, editProduct }: ProductFormProps) => {
  const [name, setName] = useState(editProduct?.name || '');
  const [quantity, setQuantity] = useState(editProduct?.quantity.toString() || '');
  const [unit, setUnit] = useState(editProduct?.unit || 'kg');
  const [pricePerUnit, setPricePerUnit] = useState(editProduct?.pricePerUnit.toString() || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  useEffect(() => {
    // Get unique product names from the Products page to populate dropdown
    const uniqueProducts = [...new Set(mockProducts.map(product => product.name))];
    setAvailableProducts(uniqueProducts);
    
    // If editing and name not in available products, add it
    if (editProduct?.name && !uniqueProducts.includes(editProduct.name)) {
      setAvailableProducts([...uniqueProducts, editProduct.name]);
    }
  }, [editProduct]);

  const handleNameChange = (selectedName: string) => {
    setName(selectedName);
    
    // Find matching product to auto-fill other fields
    const matchingProduct = mockProducts.find(p => p.name === selectedName);
    if (matchingProduct) {
      setCategory(matchingProduct.category);
      setUnit(matchingProduct.unit);
      setPricePerUnit(matchingProduct.pricePerUnit.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !quantity || !pricePerUnit) {
      return;
    }
    
    const product: Product = {
      id: editProduct?.id || `prod_${Date.now()}`,
      name,
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      category,
      date: editProduct?.date || new Date(),
      farmerId
    };
    
    onSubmit(product);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Select 
              value={name} 
              onValueChange={handleNameChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Products</SelectLabel>
                  {availableProducts.map((productName) => (
                    <SelectItem key={productName} value={productName}>
                      {productName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity"
                type="number" 
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="l">Liter (l)</SelectItem>
                  <SelectItem value="ml">Milliliter (ml)</SelectItem>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price per Unit (₹)</Label>
            <Input 
              id="price"
              type="number" 
              min="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-agri-primary hover:bg-agri-secondary">
              {editProduct ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
