import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployees } from '@/utils/employeeData';
import { Employee, Role } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import { UserPlus, Pencil, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const { checkPermission } = useAuth();
  
  // Update the type of formData to include the Role type
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as Role
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'sales'
    });
    setSelectedEmployee(null);
  };
  
  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: (employees.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      dateJoined: new Date()
    };
    
    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Employee added",
      description: `${formData.name} was successfully added as ${formData.role}.`
    });
  };
  
  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      password: employee.password,
      role: employee.role
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;
    
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return {
          ...emp,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Employee updated",
      description: `${formData.name}'s information was successfully updated.`
    });
  };
  
  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    
    toast({
      title: "Employee removed",
      description: "The employee record has been deleted."
    });
  };
  
  const canCreate = checkPermission('employees', 'create');
  const canEdit = checkPermission('employees', 'edit');
  const canDelete = checkPermission('employees', 'delete');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Employees</h1>
            {canCreate && (
              <Button 
                className="bg-agri-primary hover:bg-agri-secondary flex gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Date Joined</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          {employee.name}
                        </td>
                        <td className="p-2">{employee.email}</td>
                        <td className="p-2">{employee.phone}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.role === 'admin' 
                              ? 'bg-red-100 text-red-700' 
                              : employee.role === 'manager'
                                ? 'bg-blue-100 text-blue-700'
                                : employee.role === 'sales'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                          }`}>
                            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-2">{format(employee.dateJoined, 'MMM dd, yyyy')}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account with role-based permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Set password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Reset Password</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Employees;
