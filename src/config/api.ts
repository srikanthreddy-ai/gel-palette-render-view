
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
};
