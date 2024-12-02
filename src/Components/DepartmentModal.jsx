import React from 'react';

const DepartmentModal = ({
  onClose,
  onSubmit,
  departmentName,
  setDepartmentName,
  departmentDescription,
  setDepartmentDescription,
  isUpdate
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>x</span>
        <h2>{isUpdate ? 'Update Department' : 'Add New Department'}</h2>
        <input
          type="text"
          placeholder="Department Name"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
        />
        <textarea
          placeholder="Department Description"
          value={departmentDescription}
          onChange={(e) => setDepartmentDescription(e.target.value)}
        />
        <button 
          className={isUpdate ? 'UpdateDepartmentButtonModal' : ''} 
          onClick={onSubmit}
        >
          {isUpdate ? 'Update Department' : 'Add Department'}
        </button>
      </div>
    </div>
  );
};

export default DepartmentModal;