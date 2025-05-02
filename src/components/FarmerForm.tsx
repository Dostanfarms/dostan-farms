
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Farmer } from '@/utils/types';
import { mockFarmers } from '@/utils/mockData';

interface FarmerFormProps {
  onSubmit: (farmer: Farmer) => void;
  onCancel: () => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.accountNumber || !formData.bankName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Create new farmer
    const newFarmer: Farmer = {
      id: `${mockFarmers.length + 1}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      dateJoined: new Date(),
      products: [],
      transactions: []
    };

    onSubmit(newFarmer);
    toast({
      title: "Farmer created",
      description: "New farmer has been successfully added."
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add New Farmer</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Farmer Name *</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Enter farmer name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="Enter address" 
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input 
                id="accountNumber" 
                name="accountNumber" 
                placeholder="Enter account number" 
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input 
                id="bankName" 
                name="bankName" 
                placeholder="Enter bank name" 
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input 
                id="ifscCode" 
                name="ifscCode" 
                placeholder="Enter IFSC code" 
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-agri-primary hover:bg-agri-secondary">Save Farmer</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FarmerForm;
