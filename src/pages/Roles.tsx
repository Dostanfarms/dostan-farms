
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Role, RolePermission } from '@/utils/types';
import { rolePermissions } from '@/utils/employeeData';

const resources = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'farmers', name: 'Farmers' },
  { id: 'products', name: 'Products' },
  { id: 'sales', name: 'Add Sale' },
  { id: 'transactions', name: 'Transactions' },
  { id: 'settlements', name: 'Settlements' },
  { id: 'employees', name: 'Employees' },
  { id: 'roles', name: 'Roles' }
];

const actions = [
  { id: 'view', name: 'View' },
  { id: 'create', name: 'Create' },
  { id: 'edit', name: 'Edit' },
  { id: 'delete', name: 'Delete' }
];

const Roles = () => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [permissions, setPermissions] = useState<RolePermission['permissions']>([]);
  const [savedRolePermissions, setSavedRolePermissions] = useState<RolePermission[]>([]);

  useEffect(() => {
    // Load role permissions from localStorage or use default
    const storedPermissions = localStorage.getItem('rolePermissions');
    const initialPermissions = storedPermissions ? JSON.parse(storedPermissions) : rolePermissions;
    setSavedRolePermissions(initialPermissions);

    // Set current permissions based on selected role
    const currentRolePermissions = initialPermissions.find(
      (rp: RolePermission) => rp.role === selectedRole
    )?.permissions || [];
    setPermissions([...currentRolePermissions]);
  }, [selectedRole]);

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setPermissions(prev => {
      const resourceIndex = prev.findIndex(p => p.resource === resource);
      
      if (resourceIndex === -1 && checked) {
        // Add new resource with this action
        return [...prev, { resource, actions: [action as 'view' | 'create' | 'edit' | 'delete'] }];
      }
      
      if (resourceIndex >= 0) {
        const updatedPermissions = [...prev];
        const resourcePermission = { ...updatedPermissions[resourceIndex] };
        
        if (checked) {
          // Add action to existing resource
          resourcePermission.actions = [...resourcePermission.actions, action as 'view' | 'create' | 'edit' | 'delete'];
        } else {
          // Remove action from resource
          resourcePermission.actions = resourcePermission.actions.filter(a => a !== action);
        }
        
        updatedPermissions[resourceIndex] = resourcePermission;
        
        // If no actions left for this resource, remove it
        if (resourcePermission.actions.length === 0) {
          updatedPermissions.splice(resourceIndex, 1);
        }
        
        return updatedPermissions;
      }
      
      return prev;
    });
  };

  const handleSavePermissions = () => {
    const updatedRolePermissions = savedRolePermissions.map(rp => 
      rp.role === selectedRole ? { ...rp, permissions } : rp
    );
    
    setSavedRolePermissions(updatedRolePermissions);
    localStorage.setItem('rolePermissions', JSON.stringify(updatedRolePermissions));
    
    toast({
      title: "Permissions Updated",
      description: `Permissions for ${selectedRole} role have been updated successfully.`
    });
  };

  const hasPermission = (resource: string, action: string) => {
    const resourcePermission = permissions.find(p => p.resource === resource);
    return resourcePermission?.actions.includes(action as 'view' | 'create' | 'edit' | 'delete') || false;
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Manage permissions for different roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Role</label>
            <Select 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as Role)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Resource</TableHead>
                  {actions.map(action => (
                    <TableHead key={action.id}>{action.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    {actions.map(action => (
                      <TableCell key={action.id}>
                        <Checkbox 
                          checked={hasPermission(resource.id, action.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(resource.id, action.id, checked === true)
                          }
                          disabled={
                            // Only admin can edit the 'roles' resource permissions
                            resource.id === 'roles' && selectedRole !== 'admin' && action.id !== 'view'
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSavePermissions}>
              Save Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roles;
