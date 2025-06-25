// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pel-gel-backend.onrender.com/v1/api',
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_CONFIG.BASE_URL}/login`,
  EMPLOYEE_UPLOAD: `${API_CONFIG.BASE_URL}/employeeUpload`,
  MASTER_DATA_UPLOAD: `${API_CONFIG.BASE_URL}/masterDataUpload`,
  ALLOWANCE_DATA_UPLOAD: `${API_CONFIG.BASE_URL}/AllowenceDataUpload`,
  CREATE_ALLOWANCE: `${API_CONFIG.BASE_URL}/createAllowence`,
  UPDATE_ALLOWANCE: (id: string) => `${API_CONFIG.BASE_URL}/updateAllowence/${id}`,
  DOWNLOAD_REPORT: `${API_CONFIG.BASE_URL}/downloadReport`,
  PRODUCTION_DEPT: `${API_CONFIG.BASE_URL}/ProductionDept`,
  PRODUCTION_SHIFT: `${API_CONFIG.BASE_URL}/ProductionShift`,
  GET_ALLOWANCES: `${API_CONFIG.BASE_URL}/getAllowences`,
  EMPLOYEES_LIST: (empCode: string) => `${API_CONFIG.BASE_URL}/employeesList?empCode=${empCode}`,
  CREATE_EMP_ALLOWANCE: `${API_CONFIG.BASE_URL}/createEmpAllowence`,
  USERS_LIST: `${API_CONFIG.BASE_URL}/usersList`,
  CREATE_USER: `${API_CONFIG.BASE_URL}/createUser`,
  UPDATE_USER: (id: string) => `${API_CONFIG.BASE_URL}/userUpdate/${id}`,
};
