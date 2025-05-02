
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/utils/types';
import { mockProducts } from '@/utils/mockData';

interface ProductFormProps {
  farmerId: string;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ farmerId, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, unit: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.quantity || !formData.pricePerUnit) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const pricePerUnit = parseFloat(formData.pricePerUnit);

    if (isNaN(quantity) || isNaN(pricePerUnit) || quantity <= 0 || pricePerUnit <= 0) {
      toast({
        title: "Invalid values",
        description: "Quantity and price must be valid positive numbers.",
        variant: "destructive"
      });
      return;
    }

    // Create new product
    const newProduct: Product = {
      id: `${mockProducts.length + 1}`,
      name: formData.name,
      quantity: quantity,
      unit: formData.unit,
      pricePerUnit: pricePerUnit,
      date: new Date(),
      farmerId: farmerId
    };

    onSubmit(newProduct);
    toast({
      title: "Product added",
      description: "New product has been successfully added."
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Enter product name" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter quantity" 
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={handleSelectChange}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="l">Liter (l)</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Price Per Unit (₹) *</Label>
            <Input 
              id="pricePerUnit" 
              name="pricePerUnit" 
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price per unit" 
              value={formData.pricePerUnit}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-agri-primary hover:bg-agri-secondary">Add Product</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;
