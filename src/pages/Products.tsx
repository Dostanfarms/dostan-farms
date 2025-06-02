
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Sidebar from '@/components/Sidebar';
import ProductForm from '@/components/ProductForm';
import { mockFarmers } from '@/utils/mockData';
import { Product } from '@/utils/types';
import { Search, Plus, Package, Edit, Tag, Barcode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { saveProductsToLocalStorage, getProductsFromLocalStorage } from '@/utils/employeeData';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('1');
  
  // Load products from localStorage on component mount
  useEffect(() => {
    const storedProducts = getProductsFromLocalStorage();
    setProducts(storedProducts);
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddProduct = (newProduct: Product) => {
    let updatedProducts;
    
    if (selectedProduct) {
      // Update existing product
      updatedProducts = products.map(product => 
        product.id === newProduct.id ? newProduct : product
      );
    } else {
      // Add new product
      updatedProducts = [...products, newProduct];
    }
    
    setProducts(updatedProducts);
    saveProductsToLocalStorage(updatedProducts);
    setIsDialogOpen(false);
    setSelectedProduct(undefined);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedFarmerId(product.farmerId);
    setIsDialogOpen(true);
  };

  const getFarmerName = (farmerId: string) => {
    const farmer = mockFarmers.find(f => f.id === farmerId);
    return farmer ? farmer.name : 'Unknown Farmer';
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Products Management</h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or barcodes..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedProduct(undefined);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-agri-primary hover:bg-agri-secondary">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <ProductForm 
                    farmerId={selectedFarmerId}
                    onSubmit={handleAddProduct} 
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setSelectedProduct(undefined);
                    }}
                    editProduct={selectedProduct}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium mb-1">No products found</h3>
                  <p className="text-muted-foreground text-center">
                    No products match your search criteria. Try with a different name or barcode.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-1">No products added yet</h3>
                  <p className="text-muted-foreground text-center">
                    Get started by adding your first product using the "Add Product" button.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="bg-muted pb-2">
                    <CardTitle className="text-lg flex justify-between items-start">
                      <span>{product.name}</span>
                      <Badge variant="outline" className="bg-agri-primary/10">
                        <Tag className="h-3 w-3 mr-1" /> {product.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {product.barcode && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Barcode:</span>
                          <div className="flex items-center gap-1">
                            <Barcode className="h-3 w-3" />
                            <span className="font-mono text-xs">{product.barcode}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Unit:</span>
                        <span>{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price/Unit:</span>
                        <span>₹{product.pricePerUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Farmer:</span>
                        <span>{getFarmerName(product.farmerId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span>{product.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          className="flex-1 bg-agri-primary hover:bg-agri-secondary" 
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Products;
