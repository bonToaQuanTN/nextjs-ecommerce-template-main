export type Menu = {
  id: string;
  name: string;      
  path?: string;
  newTab?: boolean;
  submenu?: Menu[]; 
};