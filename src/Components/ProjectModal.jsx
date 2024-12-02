import React from 'react';

const ProjectModal = ({
  onClose,
  onSubmit,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  projectImage,
  setProjectImage,
  averageResponseTime,
  setAverageResponseTime,
  isUpdate,
  role,
  isBussinessOwner
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>x</span>
        <h2>{isUpdate ? 'Update Project' : 'Add New Project'}</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <textarea
          placeholder="Project Description"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Project Image URL"
          value={projectImage}
          onChange={(e) => setProjectImage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Average Response Time"
          value={averageResponseTime}
          onChange={(e) => setAverageResponseTime(e.target.value)}
        />
        {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && (
          <button 
            className={isUpdate ? 'UpdateProjectButtonModal' : 'AddProjectButtonModal'} 
            onClick={onSubmit}
          >
            {isUpdate ? 'Update Project' : 'Add Project'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;